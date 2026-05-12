// Simple script to test the brochure API endpoint
const testBrochureAPI = async () => {
  try {
  // console.log('Testing brochure API endpoint...');  // [removed by fix script]

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
  // console.log('Response:', data);  // [removed by fix script]

    if (response.ok) {
  // console.log('Test successful!');  // [removed by fix script]
    } else {
  // console.error('Test failed with status:', response.status);  // [removed by fix script]
    }
  } catch (error) {
  // console.error('Error testing API:', error);  // [removed by fix script]
  }
};

testBrochureAPI();
