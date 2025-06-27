// Backend/chosen_plaintext_attack.js
const { encrypt } = require('./rsa_crypto');

async function performChosenPlaintextAttack(db) {
  try {
    // Get some real user data for the attack
    const usersCollection = db.collection('Signup');
    const sampleUsers = await usersCollection.find({}).limit(3).toArray();
    
    if (sampleUsers.length === 0) {
      throw new Error('No users found in database');
    }
    
    // Get a user's public key
    const secureUsersCollection = db.collection('secure_users');
    const userKey = await secureUsersCollection.findOne({});
    
    if (!userKey) {
      throw new Error('No user keys found in database');
    }
    
    const publicKey = JSON.parse(userKey.publicKey);
    
    // Perform attack using real user data
    const attackResults = sampleUsers.map(user => {
      const plaintexts = [
        user.Name.substring(0, 1), // First character of name
        user.Email.substring(0, 1), // First character of email
        'A', 'B', 'C' // Control characters
      ];
      
      return {
        userId: user._id,
        attacks: plaintexts.map(pt => ({
          plaintext: pt,
          ciphertext: encrypt(publicKey, pt),
          charCode: pt.charCodeAt(0)
        }))
      };
    });
    
    // Analyze patterns
    const analysis = attackResults.map(result => {
      return {
        userId: result.userId,
        patterns: result.attacks.map(a => ({
          plaintext: a.plaintext,
          ciphertext: a.ciphertext,
          ratio: a.charCode / parseInt(a.ciphertext.split(',')[0] || '1')
        }))
      };
    });
    
    return {
      status: 'success',
      samplesUsed: sampleUsers.length,
      patternsFound: analysis[0]?.patterns.length || 0,
      conclusion: "The small key size and deterministic encryption allow plaintext inference from ciphertexts",
      analysis
    };
  } catch (error) {
    console.error('Attack failed:', error);
    return {
      status: 'error',
      message: error.message
    };
  }
}

module.exports = { performChosenPlaintextAttack };