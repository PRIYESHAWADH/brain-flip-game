#!/usr/bin/env node

/**
 * Simple test script to verify the battle server functionality
 * Run with: node test-server.js
 */

const WebSocket = require('ws');
const http = require('http');

const SERVER_URL = 'http://localhost:3001';
const WS_URL = 'ws://localhost:3001';

console.log('🧪 Testing Brain Flip Battle Server...\n');

// Test 1: Health Check
async function testHealthCheck() {
    console.log('1️⃣ Testing health check...');
    
    try {
        const response = await fetch(`${SERVER_URL}/health`);
        const data = await response.json();
        
        if (response.ok && data.status === 'healthy') {
            console.log('✅ Health check passed');
            return true;
        } else {
            console.log('❌ Health check failed:', data);
            return false;
        }
    } catch (error) {
        console.log('❌ Health check error:', error.message);
        return false;
    }
}

// Test 2: WebSocket Connection
function testWebSocketConnection() {
    return new Promise((resolve) => {
        console.log('2️⃣ Testing WebSocket connection...');
        
        const ws = new WebSocket(WS_URL);
        
        ws.on('open', () => {
            console.log('✅ WebSocket connection established');
            ws.close();
            resolve(true);
        });
        
        ws.on('error', (error) => {
            console.log('❌ WebSocket connection failed:', error.message);
            resolve(false);
        });
        
        // Timeout after 5 seconds
        setTimeout(() => {
            console.log('❌ WebSocket connection timeout');
            ws.close();
            resolve(false);
        }, 5000);
    });
}

// Test 3: Battle Stats API
async function testBattleStats() {
    console.log('3️⃣ Testing battle stats API...');
    
    try {
        const response = await fetch(`${SERVER_URL}/api/battle/stats`);
        
        if (response.status === 401) {
            console.log('✅ Battle stats API requires authentication (expected)');
            return true;
        } else if (response.ok) {
            const data = await response.json();
            console.log('✅ Battle stats API working:', data);
            return true;
        } else {
            console.log('❌ Battle stats API failed:', response.status);
            return false;
        }
    } catch (error) {
        console.log('❌ Battle stats API error:', error.message);
        return false;
    }
}

// Test 4: WebSocket Events
function testWebSocketEvents() {
    return new Promise((resolve) => {
        console.log('4️⃣ Testing WebSocket events...');
        
        const ws = new WebSocket(WS_URL);
        let eventsReceived = 0;
        
        ws.on('open', () => {
            console.log('✅ WebSocket connected, testing events...');
            
            // Test creating a room
            const createRoomEvent = {
                type: 'create_room',
                data: {
                    name: 'Test Room',
                    gameMode: 'quick-battle',
                    maxPlayers: 4,
                    timeLimit: 30000,
                    difficulty: 'medium',
                    powerUpsEnabled: true
                }
            };
            
            ws.send(JSON.stringify(createRoomEvent));
        });
        
        ws.on('message', (data) => {
            try {
                const message = JSON.parse(data);
                eventsReceived++;
                
                if (message.type === 'room_created') {
                    console.log('✅ Room creation event received');
                } else if (message.type === 'error') {
                    console.log('⚠️ Error event received:', message.message);
                } else {
                    console.log('📨 Event received:', message.type);
                }
                
                // Close connection after receiving a few events
                if (eventsReceived >= 2) {
                    ws.close();
                    resolve(true);
                }
            } catch (error) {
                console.log('❌ Failed to parse WebSocket message:', error.message);
            }
        });
        
        ws.on('error', (error) => {
            console.log('❌ WebSocket error:', error.message);
            resolve(false);
        });
        
        // Timeout after 10 seconds
        setTimeout(() => {
            console.log('❌ WebSocket events test timeout');
            ws.close();
            resolve(false);
        }, 10000);
    });
}

// Test 5: Server Performance
async function testServerPerformance() {
    console.log('5️⃣ Testing server performance...');
    
    const startTime = Date.now();
    const requests = 10;
    let successCount = 0;
    
    try {
        const promises = Array(requests).fill().map(async () => {
            try {
                const response = await fetch(`${SERVER_URL}/health`);
                if (response.ok) {
                    successCount++;
                }
            } catch (error) {
                // Ignore individual request errors
            }
        });
        
        await Promise.all(promises);
        
        const endTime = Date.now();
        const duration = endTime - startTime;
        const successRate = (successCount / requests) * 100;
        
        console.log(`✅ Performance test completed:`);
        console.log(`   - Requests: ${requests}`);
        console.log(`   - Success Rate: ${successRate.toFixed(1)}%`);
        console.log(`   - Duration: ${duration}ms`);
        console.log(`   - Average: ${(duration / requests).toFixed(1)}ms per request`);
        
        return successRate >= 80; // 80% success rate threshold
    } catch (error) {
        console.log('❌ Performance test error:', error.message);
        return false;
    }
}

// Main test runner
async function runTests() {
    console.log('🚀 Starting server tests...\n');
    
    const tests = [
        testHealthCheck,
        testWebSocketConnection,
        testBattleStats,
        testWebSocketEvents,
        testServerPerformance
    ];
    
    let passedTests = 0;
    const totalTests = tests.length;
    
    for (let i = 0; i < tests.length; i++) {
        const test = tests[i];
        const result = await test();
        
        if (result) {
            passedTests++;
        }
        
        console.log(''); // Empty line between tests
    }
    
    // Test summary
    console.log('📊 Test Summary:');
    console.log(`   - Total Tests: ${totalTests}`);
    console.log(`   - Passed: ${passedTests}`);
    console.log(`   - Failed: ${totalTests - passedTests}`);
    console.log(`   - Success Rate: ${((passedTests / totalTests) * 100).toFixed(1)}%`);
    
    if (passedTests === totalTests) {
        console.log('\n🎉 All tests passed! Server is working correctly.');
    } else {
        console.log('\n⚠️ Some tests failed. Check server logs for details.');
    }
    
    console.log('\n🔗 Server URLs:');
    console.log(`   - HTTP Server: ${SERVER_URL}`);
    console.log(`   - WebSocket: ${WS_URL}`);
    console.log(`   - Health Check: ${SERVER_URL}/health`);
}

// Check if fetch is available (Node.js 18+)
if (typeof fetch === 'undefined') {
    console.log('❌ This script requires Node.js 18+ for fetch support');
    console.log('   Please upgrade Node.js or use a polyfill');
    process.exit(1);
}

// Run tests
runTests().catch(error => {
    console.error('❌ Test runner error:', error);
    process.exit(1);
});
