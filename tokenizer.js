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

    printVocabDetails() {
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
    console.log('2. Basic Model Training (500+ daily words)');
    console.log('3. Encode Text');
    console.log('4. Decode Token IDs');
    console.log('5. View Current Vocabulary');
    console.log('6. Exit');
    console.log('=====================================');
}

async function runTokenizer() {
    console.log('Welcome to the Custom Tokenizer!\n');
    const tokenizer = new CustomTokenizer();
    
    while (true) {
        showMenu();
        const choice = await askQuestion('Enter your choice (1-6): ');
        
        switch (choice.trim()) {
            case '1':
                await handleTrainVocab(tokenizer);
                break;
            case '2':
                await handleBasicModelTraining(tokenizer);
                break;
            case '3':
                await handleEncodeText(tokenizer);
                break;
            case '4':
                await handleDecodeTokens(tokenizer);
                break;
            case '5':
                handleViewVocab(tokenizer);
                break;
            case '6':
                console.log('\nGoodbye!');
                rl.close();
                return;
            default:
                console.log('\nInvalid choice. Please enter 1-6.');
        }
    }
}

async function handleTrainVocab(tokenizer) {
    console.log('\n--- Train Vocabulary ---');
    const text = await askQuestion('Enter text to learn vocabulary from: ');
    
    if (text.trim()) {
        tokenizer.learnVocabFromText(text);
        console.log(`✓ Successfully learned vocabulary from: "${text}"`);
        tokenizer.printVocabDetails();
    } else {
        console.log('No text entered.');
    }
}

async function handleBasicModelTraining(tokenizer) {
    console.log('\n--- Basic Model Training ---');
    console.log('Training with comprehensive daily vocabulary...');
    
    const text = "Good morning everyone! Today is Monday and I need to wake up early because I have an important meeting at the office. First, I will take a hot shower, brush my teeth, wash my face, and get dressed in my business clothes. For breakfast, I usually eat bread with butter, drink fresh orange juice, and sometimes have eggs with bacon. My wife prepares lunch while I check the weather forecast on my phone and read the morning newspaper. I drive my blue car to work through the busy city streets, passing many shops, restaurants, banks, hospitals, schools, and churches along the way. The traffic is heavy during rush hour, so I listen to music on the radio while waiting at red lights. At the office building, I take the elevator to the fifth floor where my desk is located near a large window overlooking the beautiful park across the street. During work hours, I use my laptop computer to write emails, create documents, analyze data, attend virtual conferences, and communicate with colleagues from different departments. We discuss various projects, solve complex problems, make important decisions, and plan future strategies for our company. My boss is very professional and supportive, always encouraging teamwork and creativity among employees. For lunch break, I often visit the cafeteria downstairs or walk to nearby restaurants with my coworkers. We might order pizza, sandwiches, salads, soup, chicken, fish, rice, vegetables, or pasta dishes. Sometimes we grab coffee, tea, water, or soft drinks from the vending machine. During these casual conversations, we share stories about our personal lives, hobbies, interests, travel experiences, and weekend adventures. After finishing work at six o'clock, I drive back home through different routes to avoid traffic jams. At home, my family welcomes me warmly. My children show me their school assignments, art projects, and tell me about their teachers, classmates, and daily activities. My wife updates me about household matters, grocery shopping, bill payments, and social events in our neighborhood. In the evening, we prepare dinner together in the kitchen. Tonight we are cooking roasted beef with potatoes, carrots, and green beans. While waiting for food to cook, we set the dining table with plates, cups, forks, knives, spoons, and napkins. During dinner, we discuss current events, politics, sports, entertainment news, and make plans for the upcoming weekend. After dinner, we clean the dishes, wipe the table, and organize the kitchen. Then we move to the living room where we sit on comfortable sofas and watch television programs like comedy shows, drama series, documentaries, or movies. Sometimes we play board games, card games, or video games together. The children practice piano lessons while adults read magazines, books, or browse the internet on their tablets. Before bedtime, we help children with their homework assignments including mathematics, science, history, geography, language arts, and creative writing. We also prepare their school bags, uniforms, and lunch boxes for tomorrow. Parents take turns reading bedtime stories to younger kids and tucking them into their cozy beds. On weekends, our routine is more relaxed and flexible. Saturday mornings often begin with pancakes, fresh fruits, yogurt, and hot chocolate for breakfast. We might visit shopping malls, supermarkets, libraries, museums, theaters, or recreational centers. During shopping trips, we buy groceries, clothes, shoes, toys, electronics, books, medicines, and other household necessities. Sunday afternoons are perfect for outdoor activities like walking in parks, having picnics, playing sports, riding bicycles, or visiting beaches and mountains. We also spend time gardening, planting flowers, watering plants, cutting grass, and maintaining our backyard. Family gatherings with grandparents, aunts, uncles, and cousins happen frequently during holidays and special celebrations. Throughout the year, we celebrate birthdays, anniversaries, Christmas, New Year, Thanksgiving, Easter, and other cultural festivals with traditional foods, decorations, gifts, and memorable activities. We take photographs, create photo albums, and preserve precious memories of these wonderful moments. During vacation periods, we travel to different cities, states, or countries, staying in hotels, exploring historical sites, trying local cuisines, learning about diverse cultures, and meeting new people. These experiences broaden our perspectives and create lasting friendships. Technology plays a significant role in our daily lives through smartphones, computers, internet connections, social media platforms, online shopping, digital banking, streaming services, and educational apps. We stay connected with friends and relatives living far away through video calls, text messages, and social networking websites. Health and fitness are priorities in our household. We exercise regularly by jogging, swimming, cycling, or attending gym classes. We maintain balanced diets with plenty of fruits, vegetables, whole grains, lean proteins, and limited processed foods. Regular medical checkups, dental visits, and preventive care help us stay healthy and active. Financial planning involves budgeting monthly expenses, saving money for emergencies, investing in retirement accounts, paying mortgages, insurance premiums, and educational loans. We teach children about money management, the importance of saving, and making wise spending decisions. Environmental consciousness influences our lifestyle choices. We recycle materials, conserve water and electricity, use public transportation when possible, and support sustainable products. Community involvement includes volunteering at local charities, participating in neighborhood events, and contributing to social causes. Education remains a lifelong journey for everyone in our family. Adults pursue professional development through training programs, workshops, seminars, and online courses. Children excel in academics while exploring extracurricular activities like sports teams, music lessons, art classes, and science clubs. This comprehensive overview of daily life demonstrates how interconnected our personal, professional, social, and community experiences truly are in modern society today.";
    
    tokenizer.learnVocabFromText(text);
    console.log('✓ Successfully learned comprehensive daily vocabulary!');
    tokenizer.printVocabDetails();
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