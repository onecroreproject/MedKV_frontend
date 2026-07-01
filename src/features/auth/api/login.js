/**
 * Mock login API endpoint for large scale project architecture reference.
 */
export async function loginWithEmailAndPassword(email, password) {
  // In a real application, replace this with an axios/fetch request
  // return axios.post('/api/auth/login', { email, password });
  
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email && password) {
        resolve({
          user: { id: 'usr_9921', email, name: 'Dr. Sam Practitioner' },
          token: 'jwt_token_sample_abc123'
        });
      } else {
        reject(new Error('Invalid parameters'));
      }
    }, 1000);
  });
}
