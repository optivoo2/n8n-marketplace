"""
Payments router - handles payment processing with Mercado Pago and Stripe
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import Optional, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field
import os
import httpx
import hashlib
import hmac
import json

import sys
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from database import get_db, Implementation, Freelancer

router = APIRouter()

# Configuration
MERCADOPAGO_ACCESS_TOKEN = os.getenv("MERCADOPAGO_ACCESS_TOKEN", "")
MERCADOPAGO_PUBLIC_KEY = os.getenv("MERCADOPAGO_PUBLIC_KEY", "")
STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

# Pydantic models
class PaymentCreate(BaseModel):
    implementation_id: int
    payment_method: str = "mercadopago"  # mercadopago or stripe
    return_url: Optional[str] = None
    cancel_url: Optional[str] = None

class PaymentResponse(BaseModel):
    payment_id: str
    checkout_url: str
    status: str
    amount: float
    currency: str

class PaymentStatus(BaseModel):
    payment_id: str
    status: str
    amount: float
    currency: str
    paid_at: Optional[datetime] = None
    transaction_id: Optional[str] = None

class RefundRequest(BaseModel):
    payment_id: str
    amount: Optional[float] = None
    reason: Optional[str] = None

# Payment service functions
async def create_mercadopago_payment(
    implementation: Implementation,
    return_url: str,
    cancel_url: str
) -> Dict[str, Any]:
    """
    Create a payment with Mercado Pago
    """
    if not MERCADOPAGO_ACCESS_TOKEN:
        raise HTTPException(status_code=500, detail="Mercado Pago not configured")
    
    async with httpx.AsyncClient() as client:
        # Calculate platform commission (15%)
        commission = implementation.budget * 0.15
        
        # Create preference
        preference_data = {
            "items": [
                {
                    "title": implementation.title or f"Implementation #{implementation.id}",
                    "quantity": 1,
                    "unit_price": float(implementation.budget),
                    "currency_id": implementation.currency or "BRL"
                }
            ],
            "back_urls": {
                "success": return_url,
                "failure": cancel_url,
                "pending": return_url
            },
            "auto_return": "approved",
            "payment_methods": {
                "excluded_payment_types": [],
                "installments": 1,
                "default_installments": 1
            },
            "external_reference": str(implementation.id),
            "marketplace_fee": commission,
            "binary_mode": True  # Only approved or rejected, no pending
        }
        
        response = await client.post(
            "https://api.mercadopago.com/checkout/preferences",
            json=preference_data,
            headers={
                "Authorization": f"Bearer {MERCADOPAGO_ACCESS_TOKEN}",
                "Content-Type": "application/json"
            }
        )
        
        if response.status_code != 201:
            raise HTTPException(
                status_code=response.status_code,
                detail=f"Mercado Pago error: {response.text}"
            )
        
        preference = response.json()
        
        return {
            "payment_id": preference["id"],
            "checkout_url": preference["init_point"],
            "sandbox_url": preference["sandbox_init_point"]
        }

async def create_stripe_payment(
    implementation: Implementation,
    return_url: str,
    cancel_url: str
) -> Dict[str, Any]:
    """
    Create a payment with Stripe
    """
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=500, detail="Stripe not configured")
    
    import stripe
    stripe.api_key = STRIPE_SECRET_KEY
    
    try:
        # Calculate platform commission (15%)
        commission = int(implementation.budget * 0.15 * 100)  # Stripe uses cents
        
        # Create checkout session
        session = stripe.checkout.Session.create(
            payment_method_types=["card"],
            line_items=[
                {
                    "price_data": {
                        "currency": implementation.currency.lower() or "usd",
                        "product_data": {
                            "name": implementation.title or f"Implementation #{implementation.id}",
                            "description": implementation.description[:500] if implementation.description else None,
                        },
                        "unit_amount": int(implementation.budget * 100),  # Convert to cents
                    },
                    "quantity": 1,
                }
            ],
            mode="payment",
            success_url=return_url,
            cancel_url=cancel_url,
            client_reference_id=str(implementation.id),
            payment_intent_data={
                "application_fee_amount": commission,
                "metadata": {
                    "implementation_id": str(implementation.id),
                    "freelancer_id": str(implementation.freelancer_id)
                }
            }
        )
        
        return {
            "payment_id": session.id,
            "checkout_url": session.url
        }
    
    except stripe.error.StripeError as e:
        raise HTTPException(status_code=400, detail=str(e))

# Routes
@router.post("/create", response_model=PaymentResponse)
async def create_payment(
    payment_data: PaymentCreate,
    db: AsyncSession = Depends(get_db)
):
    """
    Create a new payment for an implementation
    """
    # Get implementation
    query = select(Implementation).where(Implementation.id == payment_data.implementation_id)
    result = await db.execute(query)
    implementation = result.scalar_one_or_none()
    
    if not implementation:
        raise HTTPException(status_code=404, detail="Implementation not found")
    
    if implementation.payment_status == "paid":
        raise HTTPException(status_code=400, detail="Implementation already paid")
    
    # Set default URLs
    base_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
    return_url = payment_data.return_url or f"{base_url}/payment/success?impl={implementation.id}"
    cancel_url = payment_data.cancel_url or f"{base_url}/payment/cancel?impl={implementation.id}"
    
    # Create payment based on method
    if payment_data.payment_method == "mercadopago":
        payment_result = await create_mercadopago_payment(
            implementation, return_url, cancel_url
        )
    elif payment_data.payment_method == "stripe":
        payment_result = await create_stripe_payment(
            implementation, return_url, cancel_url
        )
    else:
        raise HTTPException(status_code=400, detail="Invalid payment method")
    
    # Update implementation with payment info
    implementation.payment_status = "pending"
    implementation.transaction_id = payment_result["payment_id"]
    
    await db.commit()
    
    return PaymentResponse(
        payment_id=payment_result["payment_id"],
        checkout_url=payment_result["checkout_url"],
        status="pending",
        amount=implementation.budget,
        currency=implementation.currency
    )

@router.get("/status/{payment_id}", response_model=PaymentStatus)
async def get_payment_status(
    payment_id: str,
    payment_method: str = "mercadopago",
    db: AsyncSession = Depends(get_db)
):
    """
    Get payment status
    """
    if payment_method == "mercadopago":
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.mercadopago.com/v1/payments/search?external_reference={payment_id}",
                headers={"Authorization": f"Bearer {MERCADOPAGO_ACCESS_TOKEN}"}
            )
            
            if response.status_code != 200:
                raise HTTPException(status_code=404, detail="Payment not found")
            
            data = response.json()
            if data["results"]:
                payment = data["results"][0]
                return PaymentStatus(
                    payment_id=payment_id,
                    status=payment["status"],
                    amount=payment["transaction_amount"],
                    currency=payment["currency_id"],
                    paid_at=payment.get("date_approved"),
                    transaction_id=str(payment["id"])
                )
    
    elif payment_method == "stripe":
        import stripe
        stripe.api_key = STRIPE_SECRET_KEY
        
        try:
            session = stripe.checkout.Session.retrieve(payment_id)
            return PaymentStatus(
                payment_id=payment_id,
                status="paid" if session.payment_status == "paid" else "pending",
                amount=session.amount_total / 100,  # Convert from cents
                currency=session.currency.upper(),
                transaction_id=session.payment_intent
            )
        except stripe.error.StripeError:
            raise HTTPException(status_code=404, detail="Payment not found")
    
    raise HTTPException(status_code=400, detail="Invalid payment method")

@router.post("/refund", response_model=Dict[str, str])
async def process_refund(
    refund_data: RefundRequest,
    db: AsyncSession = Depends(get_db)
):
    """
    Process a refund for a payment
    """
    # Get implementation by transaction ID
    query = select(Implementation).where(Implementation.transaction_id == refund_data.payment_id)
    result = await db.execute(query)
    implementation = result.scalar_one_or_none()
    
    if not implementation:
        raise HTTPException(status_code=404, detail="Payment not found")
    
    if implementation.payment_status != "paid":
        raise HTTPException(status_code=400, detail="Payment not completed")
    
    # Process refund based on payment method
    # This is a simplified version - in production, you'd need proper refund handling
    
    implementation.payment_status = "refunded"
    await db.commit()
    
    return {"status": "refund_initiated", "message": "Refund has been initiated"}

@router.post("/webhook/mercadopago")
async def mercadopago_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Mercado Pago webhook notifications
    """
    body = await request.body()
    data = json.loads(body)
    
    # Verify webhook signature (simplified - implement proper verification in production)
    # https://www.mercadopago.com.br/developers/pt/docs/your-integrations/notifications/webhooks
    
    if data.get("type") == "payment":
        payment_id = data["data"]["id"]
        
        # Get payment details
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"https://api.mercadopago.com/v1/payments/{payment_id}",
                headers={"Authorization": f"Bearer {MERCADOPAGO_ACCESS_TOKEN}"}
            )
            
            if response.status_code == 200:
                payment = response.json()
                external_reference = payment.get("external_reference")
                
                if external_reference:
                    # Update implementation
                    query = select(Implementation).where(Implementation.id == int(external_reference))
                    result = await db.execute(query)
                    implementation = result.scalar_one_or_none()
                    
                    if implementation:
                        if payment["status"] == "approved":
                            implementation.payment_status = "paid"
                            implementation.commission_amount = payment["fee_details"][0]["amount"] if payment.get("fee_details") else 0
                        elif payment["status"] == "rejected":
                            implementation.payment_status = "failed"
                        
                        await db.commit()
    
    return {"status": "ok"}

@router.post("/webhook/stripe")
async def stripe_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db)
):
    """
    Handle Stripe webhook notifications
    """
    payload = await request.body()
    sig_header = request.headers.get("stripe-signature")
    
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=500, detail="Stripe webhook not configured")
    
    try:
        import stripe
        stripe.api_key = STRIPE_SECRET_KEY
        
        event = stripe.Webhook.construct_event(
            payload, sig_header, STRIPE_WEBHOOK_SECRET
        )
        
        if event["type"] == "checkout.session.completed":
            session = event["data"]["object"]
            implementation_id = int(session["client_reference_id"])
            
            # Update implementation
            query = select(Implementation).where(Implementation.id == implementation_id)
            result = await db.execute(query)
            implementation = result.scalar_one_or_none()
            
            if implementation:
                implementation.payment_status = "paid"
                implementation.transaction_id = session["payment_intent"]
                implementation.commission_amount = session.get("application_fee_amount", 0) / 100
                await db.commit()
        
        return {"status": "ok"}
    
    except ValueError:
        raise HTTPException(status_code=400, detail="Invalid payload")
    except stripe.error.SignatureVerificationError:
        raise HTTPException(status_code=400, detail="Invalid signature")

@router.get("/revenue/summary")
async def get_revenue_summary(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    db: AsyncSession = Depends(get_db)
):
    """
    Get revenue summary (admin only)
    """
    from sqlalchemy import func, and_
    
    query = select(
        func.count(Implementation.id).label("total_transactions"),
        func.sum(Implementation.budget).label("total_revenue"),
        func.sum(Implementation.commission_amount).label("total_commission"),
        func.avg(Implementation.budget).label("average_transaction")
    ).where(Implementation.payment_status == "paid")
    
    if start_date:
        query = query.where(Implementation.completed_at >= start_date)
    if end_date:
        query = query.where(Implementation.completed_at <= end_date)
    
    result = await db.execute(query)
    summary = result.one()
    
    return {
        "total_transactions": summary.total_transactions or 0,
        "total_revenue": float(summary.total_revenue or 0),
        "total_commission": float(summary.total_commission or 0),
        "average_transaction": float(summary.average_transaction or 0),
        "period": {
            "start": start_date.isoformat() if start_date else None,
            "end": end_date.isoformat() if end_date else None
        }
    }
