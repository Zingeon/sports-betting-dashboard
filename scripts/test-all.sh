#!/bin/bash

echo "Running tests for bets-service..."
npx jest apps/bets-service/test || exit 1

echo "Running tests for odds-service..."
npx jest apps/odds-service/test || exit 1

echo "Running tests for dashboard-service with experimental-vm-modules..."
node --experimental-vm-modules ./node_modules/.bin/jest apps/dashboard-service/test || exit 1

echo "All tests passed!"
