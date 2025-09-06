#!/bin/bash

# Test script for the n8n Marketplace API
# Run this after deployment to verify everything works

API_URL="http://localhost:8000"

echo "🧪 Testing n8n Marketplace API..."
echo "================================"

# 1. Health Check
echo "1. Health Check..."
curl -s "$API_URL/health" | python3 -m json.tool
echo ""

# 2. Root endpoint
echo "2. API Info..."
curl -s "$API_URL/" | python3 -m json.tool
echo ""

# 3. Test AI Query endpoint
echo "3. Testing AI Query Endpoint..."
curl -s -X POST "$API_URL/api/ai/query" \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Find Gmail automation templates",
    "context": {"limit": 5}
  }' | python3 -m json.tool
echo ""

# 4. Test AI Action endpoint
echo "4. Testing AI Action Endpoint..."
curl -s -X POST "$API_URL/api/ai/action" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "search_templates",
    "parameters": {
      "category": "Gmail",
      "limit": 3
    }
  }' | python3 -m json.tool
echo ""

echo "✅ API Test Complete!"
echo ""
echo "📚 Check API documentation at: $API_URL/api/docs"
