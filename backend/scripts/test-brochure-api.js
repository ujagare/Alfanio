// Simple script to test the brochure API endpoint
const testBrochureAPI = async () => {
  try {
    console.log('Testing brochure API endpoint...');

    const response = await fetch('http://localhost:5001/api/contact/brochure', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        phone: '1234567890',
        message: 'This is a test message'
      }),
    });

    const data = await response.json();
    console.log('Response:', data);

    if (response.ok) {
      console.log('Test successful!');
    } else {
      console.error('Test failed with status:', response.status);
    }
  } catch (error) {
    console.error('Error testing API:', error);
  }
};

testBrochureAPI();
