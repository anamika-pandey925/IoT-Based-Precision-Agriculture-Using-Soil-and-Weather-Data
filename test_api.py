
import unittest
import json
import io
import sys
import os

# Add the python directory to sys.path
# We assume we are running from the root of the project
sys.path.append(os.path.join(os.getcwd(), 'python'))

from app import app

class TestAgricultureApp(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_chat_api(self):
        # Test finding temperature
        response = self.app.post('/api/chat', 
                                 data=json.dumps({'message': 'What is the temp?'}),
                                 content_type='application/json')
        data = json.loads(response.data)
        print(f"\nChat Response (Temp): {data['response']}")
        self.assertIn('temperature', data['response'].lower())
        
        # Test greeting
        response = self.app.post('/api/chat', 
                                 data=json.dumps({'message': 'Hello'}),
                                 content_type='application/json')
        data = json.loads(response.data)
        print(f"Chat Response (Hello): {data['response']}")
        self.assertIn('Agriculture Assistant', data['response'])

    def test_scan_api(self):
        # Mock file upload
        data = {
            'image': (io.BytesIO(b"dummy image data"), 'test.jpg')
        }
        response = self.app.post('/api/scan', data=data, content_type='multipart/form-data')
        data = json.loads(response.data)
        print(f"\nScan Result: {data}")
        self.assertIn('status', data)
        self.assertIn('confidence', data)

if __name__ == '__main__':
    unittest.main()
