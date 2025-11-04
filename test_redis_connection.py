#!/usr/bin/env python3
"""
Simple Redis connection test for the portfolio backend
Tests connectivity to the Railway Redis instance
"""

import urllib.parse
import socket
import sys

def test_redis_connection():
    """Test Redis connection using the provided Railway URL"""
    redis_url = "redis://default:pkBNZGuCsUuZjMNuHTvDQbkcKhBNCpdd@switchback.proxy.rlwy.net:44804"
    
    try:
        # Parse the Redis URL
        parsed = urllib.parse.urlparse(redis_url)
        host = parsed.hostname
        port = parsed.port
        
        print(f"Testing Redis connection to {host}:{port}")
        
        # Test basic TCP connectivity
        sock = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        sock.settimeout(10)
        result = sock.connect_ex((host, port))
        sock.close()
        
        if result == 0:
            print("✅ Redis server is reachable!")
            print(f"Host: {host}")
            print(f"Port: {port}")
            print(f"Database: {parsed.path.lstrip('/') or '0'}")
            return True
        else:
            print("❌ Redis server is not reachable")
            return False
            
    except Exception as e:
        print(f"❌ Error testing Redis connection: {e}")
        return False

if __name__ == "__main__":
    print("🔌 Portfolio Redis Connection Test")
    print("=" * 40)
    
    success = test_redis_connection()
    
    if success:
        print("\n✅ Redis connection test passed!")
        print("The backend should be able to connect to Redis successfully.")
    else:
        print("\n❌ Redis connection test failed!")
        print("Please check the Redis URL and network connectivity.")
    
    sys.exit(0 if success else 1)