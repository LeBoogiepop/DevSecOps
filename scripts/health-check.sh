#!/bin/bash

# Health check script for all services
# Usage: ./scripts/health-check.sh

set -e

echo "🏥 Starting health checks..."

services=(
    "http://localhost:8080/health:API Gateway"
    "http://localhost:3001/health:User Service"
    "http://localhost:3002/health:Order Service"
)

failed=0

for service_info in "${services[@]}"; do
    IFS=':' read -r url name <<< "$service_info"
    
    echo -n "Checking $name ($url)... "
    
    if response=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 "$url" 2>/dev/null); then
        if [ "$response" -eq 200 ]; then
            echo "✅ OK"
        else
            echo "❌ FAILED (HTTP $response)"
            failed=$((failed + 1))
        fi
    else
        echo "❌ FAILED (Connection error)"
        failed=$((failed + 1))
    fi
done

if [ $failed -eq 0 ]; then
    echo ""
    echo "✅ All services are healthy!"
    exit 0
else
    echo ""
    echo "❌ $failed service(s) failed health check"
    exit 1
fi
