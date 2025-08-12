# Custom Dynamic Tokenizer

A JavaScript-based tokenizer that learns vocabulary dynamically and handles unknown words through alphanumeric encoding.

## Table of Contents
- [Overview](#overview)
- [Features](#features)
- [Installation & Setup](#installation--setup)
- [How It Works](#how-it-works)
- [Special Tokens](#special-tokens)
- [Alphanumeric Encoding](#alphanumeric-encoding)
- [Usage Guide](#usage-guide)
- [Menu Options](#menu-options)
- [Step-by-Step Tutorial](#step-by-step-tutorial)
- [Examples](#examples)
- [Technical Details](#technical-details)
- [Troubleshooting](#troubleshooting)

## Overview

This custom tokenizer is designed to convert text into numerical tokens and back to text. Unlike traditional tokenizers with fixed vocabularies, this one learns new words dynamically and handles unknown words through a special alphanumeric encoding system.

## Features

- **Dynamic Vocabulary Learning**: Builds vocabulary as it encounters new words
- **Special Token Support**: Includes padding, unknown, start, and end tokens
- **Alphanumeric Fallback**: Encodes unknown words character-by-character
- **Bidirectional**: Can encode text to tokens and decode tokens back to text
- **Menu-Driven Interface**: Interactive console application
- **Comprehensive Training**: Built-in training with 500+ daily vocabulary words

## Installation & Setup

1. **Save the tokenizer code** as `tokenizer.js`
2. **Ensure Node.js is installed** on your system
3. **Run the application**:
   ```bash
   node tokenizer.js
   ```

## How It Works

### Vocabulary Management
- Words are stored in two dictionaries: `wordToId` and `idToWord`
- Each new word gets assigned the next available ID (starting from 4)
- The tokenizer is case-insensitive (converts all text to lowercase)

### Encoding Process
1. Split input text into words (by whitespace)
2. For each word:
   - If word exists in vocabulary → use its ID
   - If word is unknown → use alphanumeric encoding

### Decoding Process
1. Process each token ID sequentially
2. For regular IDs → look up corresponding word
3. For alphanumeric sequences (999...998) → convert back to characters

## Special Tokens

| Token | ID | Purpose |
|-------|----|---------| 
| `<PAD>` | 0 | Padding sequences to equal length |
| `<UNK>` | 1 | Unknown/unrecognized tokens |
| `<START>` | 2 | Beginning of sequence marker |
| `<END>` | 3 | End of sequence marker |

## Alphanumeric Encoding

When the tokenizer encounters an unknown word, it encodes each character using this mapping:

| Characters | Range | Example |
|------------|-------|---------|
| A-Z (uppercase) | 1-26 | A=1, B=2, Z=26 |
| a-z (lowercase) | 27-52 | a=27, b=28, z=52 |
| 0-9 (digits) | 53-62 | 0=53, 1=54, 9=62 |

### Alphanumeric Sequence Structure
```
[999] [char1] [char2] [char3] ... [998]
```
- `999` = Start alphanumeric mode
- Character codes in between
- `998` = End alphanumeric mode

### Example
Word "xyz" (unknown) becomes:
```
999 → 50 → 51 → 52 → 998
(start) (x) (y) (z) (end)
```

## Usage Guide

### Running the Application
```bash
node tokenizer.js
```

You'll see the main menu with 6 options.

## Menu Options

### 1. Train Vocabulary (learn from text)
- **Purpose**: Add new words to the vocabulary from custom text
- **Input**: Any text string
- **Output**: Updated vocabulary with new word-to-ID mappings

### 2. Basic Model Training (500+ daily words)
- **Purpose**: Instantly train with comprehensive daily vocabulary
- **Input**: None (uses pre-built training text)
- **Output**: Vocabulary with 500+ common words

### 3. Encode Text
- **Purpose**: Convert text into token IDs
- **Input**: Text string to encode
- **Output**: Array of token IDs with encoding breakdown

### 4. Decode Token IDs
- **Purpose**: Convert token IDs back to text
- **Input**: Token IDs (space or comma separated)
- **Output**: Decoded text string

### 5. View Current Vocabulary
- **Purpose**: Display all learned words and their IDs
- **Input**: None
- **Output**: Complete vocabulary listing with statistics

### 6. Exit
- **Purpose**: Close the application

## Step-by-Step Tutorial

### Getting Started

#### Step 1: Initial Setup
1. Run `node tokenizer.js`
2. You'll see the welcome message and menu

#### Step 2: Build Basic Vocabulary
1. Select option **2** (Basic Model Training)
2. This loads 500+ common daily words automatically
3. Select option **5** to view the vocabulary

#### Step 3: Test Encoding
1. Select option **3** (Encode Text)
2. Try encoding: `"good morning everyone today"`
3. All words should be recognized (no alphanumeric encoding)

#### Step 4: Test Unknown Words
1. Select option **3** (Encode Text)
2. Try encoding: `"hello xyz123 unknown"`
3. You'll see mixed encoding (known words + alphanumeric for unknown)

#### Step 5: Test Decoding
1. Copy the token IDs from step 4
2. Select option **4** (Decode Token IDs)
3. Paste the token IDs
4. Verify the decoded text matches the original

### Advanced Usage

#### Custom Vocabulary Training
1. Select option **1** (Train Vocabulary)
2. Enter domain-specific text (e.g., technical terms, names)
3. The tokenizer learns these new words
4. Future encoding will use direct IDs for these words

#### Handling Complex Input
- **Mixed case**: "Hello WORLD" → converted to "hello world"
- **Punctuation**: Generally ignored during word splitting
- **Numbers**: "123" encoded alphanumerically if not in vocabulary
- **Special characters**: Skipped if not in alphanumeric map

## Examples

### Example 1: Basic Encoding
**Input**: `"the quick brown fox"`
**After training with basic vocabulary**:
```
Encoded: [4, 67, 68, 69]
Breakdown:
- "the" → 4 (known)
- "quick" → 67 (known)
- "brown" → 68 (known) 
- "fox" → 69 (known)
```

### Example 2: Mixed Known/Unknown
**Input**: `"hello xyz world"`
**After basic training**:
```
Encoded: [12, 999, 50, 51, 52, 998, 13]
Breakdown:
- "hello" → 12 (known)
- "xyz" → 999, 50, 51, 52, 998 (alphanumeric)
- "world" → 13 (known)
```

### Example 3: Numbers and Text
**Input**: `"test 123 code"`
```
Encoded: [45, 999, 54, 55, 56, 998, 78]
Breakdown:
- "test" → 45 (known)
- "123" → 999, 54, 55, 56, 998 (1=54, 2=55, 3=56)
- "code" → 78 (known)
```

## Technical Details

### Class Structure
```javascript
class CustomTokenizer {
    // Core dictionaries
    wordToId: {}      // Word → ID mapping
    idToWord: {}      // ID → Word mapping
    nextId: number    // Next available ID
    
    // Character mappings
    charToAlpha: {}   // Character → Alphanumeric code
    alphaToChar: {}   // Alphanumeric code → Character
}
```

### Key Methods
- `learnVocabFromText(text)` - Adds new words to vocabulary
- `encode(text)` - Converts text to token IDs
- `decode(tokenIds)` - Converts token IDs to text
- `printVocab()` - Displays current vocabulary

### Memory Requirements
- Each word: ~50-100 bytes (depending on length)
- 500 words: ~25-50 KB
- 1000 words: ~50-100 KB
- Very lightweight for most applications

## Troubleshooting

### Common Issues

#### "Character not in alphanumeric map"
**Problem**: Input contains special characters (!, @, #, etc.)
**Solution**: These characters are skipped. Only A-Z, a-z, 0-9 are supported
**Workaround**: Add these characters to vocabulary through training

#### "Invalid choice" in menu
**Problem**: Entered non-numeric menu option
**Solution**: Enter numbers 1-6 only

#### "Error parsing token IDs"
**Problem**: Invalid format when decoding
**Solution**: Enter token IDs as numbers separated by spaces or commas
**Example**: `"4 999 50 51 998"` or `"4,999,50,51,998"`

#### Empty or undefined results
**Problem**: Input text contains only whitespace or special characters
**Solution**: Provide meaningful text with alphanumeric characters

### Performance Considerations

#### Large Vocabulary
- Vocabulary lookup is O(1) for encoding/decoding
- Memory usage grows linearly with vocabulary size
- No practical limit for typical applications

#### Large Text Processing
- Processing is O(n) where n is number of words
- Unknown words require additional processing for alphanumeric encoding
- Performance remains good for texts up to thousands of words

### Best Practices

1. **Start with Basic Training**: Use option 2 for comprehensive daily vocabulary
2. **Incremental Learning**: Add domain-specific words through option 1
3. **Test Thoroughly**: Always test encoding/decoding pairs to verify accuracy
4. **Monitor Vocabulary**: Use option 5 to track vocabulary growth
5. **Handle Unknown Words**: Understand that unknown words will use more tokens

### Extending the Tokenizer

#### Adding New Special Characters
To support characters like punctuation in alphanumeric mode:
```javascript
// In buildCharMap(), add:
charMap['.'] = 63;
charMap[','] = 64;
charMap['!'] = 65;
```

#### Custom Special Tokens
Add new special tokens by modifying the constructor:
```javascript
this.wordToId['<CUSTOM>'] = 4;
this.idToWord[4] = '<CUSTOM>';
this.nextId = 5; // Update starting ID
```

#### Batch Processing
For processing multiple texts:
```javascript
const texts = ["text1", "text2", "text3"];
texts.forEach(text => tokenizer.learnVocabFromText(text));
```

## Conclusion

This custom tokenizer provides a flexible foundation for text processing applications. Its dynamic vocabulary learning and alphanumeric fallback ensure that no text is completely unprocessable, while maintaining efficiency for known vocabulary.

The menu-driven interface makes it easy to experiment with different texts and understand how the tokenization process works in practice.