#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}   Campus Connect - Upgrade Setup${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if .env files exist
echo -e "${YELLOW}Step 1: Checking environment files...${NC}"
if [ ! -f "server/.env" ]; then
    echo -e "${YELLOW}Creating server/.env from example...${NC}"
    cp server/.env.example server/.env
    echo -e "${GREEN}✓ Created server/.env${NC}"
    echo -e "${RED}⚠ IMPORTANT: Edit server/.env and add your HUGGING_FACE_TOKEN${NC}"
else
    echo -e "${GREEN}✓ server/.env exists${NC}"
fi

if [ ! -f "client/.env" ]; then
    echo -e "${YELLOW}Creating client/.env from example...${NC}"
    cp client/.env.example client/.env
    echo -e "${GREEN}✓ Created client/.env${NC}"
else
    echo -e "${GREEN}✓ client/.env exists${NC}"
fi

echo ""

# Install server dependencies
echo -e "${YELLOW}Step 2: Installing server dependencies...${NC}"
cd server
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Server dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install server dependencies${NC}"
    exit 1
fi
cd ..

echo ""

# Install client dependencies
echo -e "${YELLOW}Step 3: Installing client dependencies...${NC}"
cd client
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Client dependencies installed${NC}"
else
    echo -e "${RED}✗ Failed to install client dependencies${NC}"
    exit 1
fi
cd ..

echo ""

# Run backend tests
echo -e "${YELLOW}Step 4: Running backend tests...${NC}"
cd server
npm test
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ All backend tests passed!${NC}"
else
    echo -e "${RED}✗ Some backend tests failed${NC}"
fi
cd ..

echo ""

# Run frontend tests
echo -e "${YELLOW}Step 5: Running frontend tests...${NC}"
cd client
npm test -- --run
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ All frontend tests passed!${NC}"
else
    echo -e "${RED}✗ Some frontend tests failed${NC}"
fi
cd ..

echo ""
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}Setup Complete!${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Next steps:"
echo -e "1. Edit ${YELLOW}server/.env${NC} and add your HUGGING_FACE_TOKEN"
echo -e "2. Run ${YELLOW}docker-compose up${NC} to start the application"
echo -e "3. Visit ${YELLOW}http://localhost:5173${NC} to see the app"
echo ""
echo -e "For more information, see ${YELLOW}UPGRADES.md${NC}"
echo ""
