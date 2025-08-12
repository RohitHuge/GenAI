class CustomTokenizer {
    constructor() {
        // Initialize with special tokens
        this.wordToId = {
            '<PAD>': 0,
            '<UNK>': 1,
            '<START>': 2,
            '<END>': 3
        };
        
        this.idToWord = {
            0: '<PAD>',
            1: '<UNK>',
            2: '<START>',
            3: '<END>'
        };
        
        this.nextId = 4; // Start regular words from ID 4
        
        // Special tokens for alphanumeric mode
        this.ALPHA_START = 999;
        this.ALPHA_END = 998;
        
        // Alphanumeric character mapping
        this.charToAlpha = this.buildCharMap();
        this.alphaToChar = this.buildReverseCharMap();
    }
    
    buildCharMap() {
        const charMap = {};
        
        // A-Z: 1-26
        for (let i = 0; i < 26; i++) {
            charMap[String.fromCharCode(65 + i)] = i + 1;
        }
        
        // a-z: 27-52
        for (let i = 0; i < 26; i++) {
            charMap[String.fromCharCode(97 + i)] = i + 27;
        }
        
        // 0-9: 53-62
        for (let i = 0; i < 10; i++) {
            charMap[i.toString()] = i + 53;
        }
        
        return charMap;
    }
    
    buildReverseCharMap() {
        const reverseMap = {};
        for (const [char, num] of Object.entries(this.charToAlpha)) {
            reverseMap[num] = char;
        }
        return reverseMap;
    }
    
    learnVocabFromText(text) {
        // Split text into words (by whitespace)
        const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        
        for (const word of words) {
            if (!(word in this.wordToId)) {
                this.wordToId[word] = this.nextId;
                this.idToWord[this.nextId] = word;
                this.nextId++;
            }
        }
    }
    
    encode(text) {
        const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        const tokens = [];
        
        for (const word of words) {
            if (word in this.wordToId) {
                // Known word - add its ID
                tokens.push(this.wordToId[word]);
            } else {
                // Unknown word - encode alphanumerically
                tokens.push(this.ALPHA_START); // 999 - start alphanumeric mode
                
                for (const char of word) {
                    if (char in this.charToAlpha) {
                        tokens.push(this.charToAlpha[char]);
                    } else {
                        // If character not in our alphanumeric map, skip it
                        // (or could use UNK token)
                        console.warn(`Character '${char}' not in alphanumeric map, skipping`);
                    }
                }
                
                tokens.push(this.ALPHA_END); // 998 - end alphanumeric mode
            }
        }
        
        return tokens;
    }
    
    decode(tokenIds) {
        const words = [];
        let i = 0;
        
        while (i < tokenIds.length) {
            const tokenId = tokenIds[i];
            
            if (tokenId === this.ALPHA_START) {
                // Start of alphanumeric mode - decode until ALPHA_END
                i++; // Skip the 999 token
                let alphaWord = '';
                
                while (i < tokenIds.length && tokenIds[i] !== this.ALPHA_END) {
                    const alphaNum = tokenIds[i];
                    if (alphaNum in this.alphaToChar) {
                        alphaWord += this.alphaToChar[alphaNum];
                    }
                    i++;
                }
                
                if (i < tokenIds.length && tokenIds[i] === this.ALPHA_END) {
                    i++; // Skip the 998 token
                }
                
                words.push(alphaWord);
            } else if (tokenId in this.idToWord) {
                // Known token ID
                words.push(this.idToWord[tokenId]);
                i++;
            } else {
                // Unknown token ID - use UNK
                words.push('<UNK>');
                i++;
            }
        }
        
        return words.join(' ');
    }
    
    printVocab() {
        console.log('\n=== Current Vocabulary ===');
        const sortedEntries = Object.entries(this.wordToId).sort((a, b) => a[1] - b[1]);
        
        for (const [word, id] of sortedEntries) {
            console.log(`${id}: "${word}"`);
        }
        
        console.log(`\nTotal vocabulary size: ${Object.keys(this.wordToId).length}`);
        console.log(`Next available ID: ${this.nextId}`);
    }
}

// Menu-driven CLI interface
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise(resolve => {
        rl.question(question, answer => {
            resolve(answer);
        });
    });
}

function showMenu() {
    console.log('\n=== Custom Tokenizer Menu ===');
    console.log('1. Train Vocabulary (learn from text)');
    console.log('2. Encode Text');
    console.log('3. Decode Token IDs');
    console.log('4. View Current Vocabulary');
    console.log('5. Exit');
    console.log('=====================================');
}

async function runTokenizer() {
    console.log('Welcome to the Custom Tokenizer!\n');
    const tokenizer = new CustomTokenizer();
    
    while (true) {
        showMenu();
        const choice = await askQuestion('Enter your choice (1-5): ');
        
        switch (choice.trim()) {
            case '1':
                await handleTrainVocab(tokenizer);
                break;
            case '2':
                await handleEncodeText(tokenizer);
                break;
            case '3':
                await handleDecodeTokens(tokenizer);
                break;
            case '4':
                handleViewVocab(tokenizer);
                break;
            case '5':
                console.log('\nGoodbye!');
                rl.close();
                return;
            default:
                console.log('\nInvalid choice. Please enter 1-5.');
        }
    }
}

async function handleTrainVocab(tokenizer) {
    console.log('\n--- Train Vocabulary ---');
    const text = await askQuestion('Enter text to learn vocabulary from: ');
    
    if (text.trim()) {
        tokenizer.learnVocabFromText(text);
        console.log(`✓ Successfully learned vocabulary from: "${text}"`);
        tokenizer.printVocab();
    } else {
        console.log('No text entered.');
    }
}

async function handleEncodeText(tokenizer) {
    console.log('\n--- Encode Text ---');
    const text = await askQuestion('Enter text to encode: ');
    
    if (text.trim()) {
        const encoded = tokenizer.encode(text);
        console.log(`\nOriginal text: "${text}"`);
        console.log(`Encoded tokens: [${encoded.join(', ')}]`);
        
        // Show breakdown for unknown words
        const words = text.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        console.log('\nEncoding breakdown:');
        for (const word of words) {
            if (word in tokenizer.wordToId) {
                console.log(`  "${word}" → ${tokenizer.wordToId[word]} (known word)`);
            } else {
                console.log(`  "${word}" → alphanumeric mode (unknown word)`);
            }
        }
    } else {
        console.log('No text entered.');
    }
}

async function handleDecodeTokens(tokenizer) {
    console.log('\n--- Decode Token IDs ---');
    console.log('Enter token IDs separated by spaces or commas (e.g., "4 999 50 51 52 998")');
    const input = await askQuestion('Token IDs: ');
    
    if (input.trim()) {
        try {
            // Parse the input - handle both space and comma separated values
            const tokenIds = input.split(/[\s,]+/)
                                  .filter(token => token.trim())
                                  .map(token => {
                                      const num = parseInt(token.trim());
                                      if (isNaN(num)) {
                                          throw new Error(`"${token}" is not a valid number`);
                                      }
                                      return num;
                                  });
            
            if (tokenIds.length === 0) {
                console.log('No valid token IDs found.');
                return;
            }
            
            const decoded = tokenizer.decode(tokenIds);
            console.log(`\nToken IDs: [${tokenIds.join(', ')}]`);
            console.log(`Decoded text: "${decoded}"`);
        } catch (error) {
            console.log(`Error parsing token IDs: ${error.message}`);
        }
    } else {
        console.log('No token IDs entered.');
    }
}

function handleViewVocab(tokenizer) {
    console.log('\n--- Current Vocabulary ---');
    tokenizer.printVocab();
    
    console.log('\nAlphanumeric encoding reference:');
    console.log('A-Z: 1-26, a-z: 27-52, 0-9: 53-62');
    console.log('Special tokens: 999 (start alphanumeric), 998 (end alphanumeric)');
}

// Start the application
if (require.main === module) {
    runTokenizer().catch(error => {
        console.error('An error occurred:', error);
        rl.close();
    });
}

module.exports = CustomTokenizer;