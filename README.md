# BROtonomous

An autonomous agent that can do all sorts of onchain operations using Coinbase Developer Platform.

<img width="996" alt="Captura de ecrã 2024-11-16, às 23 10 55" src="https://github.com/user-attachments/assets/662b90e7-9b49-4a6e-95a8-f2e9d8c4e5d6">

## Features

- Autonomous Agent
- Social media integration (Twitter)
- Telegram bot for monitoring and control
- Onchain operations (transfers, trading, balance checks)
- Progress tracking and status updates

## Prerequisites

- Bun runtime environment
- Coinbase Wallet
- Twitter API credentials
- Telegram Bot token
- OpenAI API key

## Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   bun install
   ```
3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Then edit `.env` with your:
   - OPENAI_API_KEY
   - TELEGRAM_BOT_TOKEN
   - TWITTER_API_KEY
   - TWITTER_API_SECRET
   - COINBASE_API_KEY

## Usage

1. Start the server:
   ```bash
   bun start
   ```

2. Monitor progress:
   - Visit `http://localhost:3000/progress` for web interface
   - Use Telegram bot commands:
     - `/start` - Initialize the bot
     - `/task` - Create a new task
     - `/progress` - View current progress

## Architecture

- Uses GPT-4 for autonomous decision making and task planning
- Integrates with Coinbase Wallet for blockchain operations
- Telegram bot for monitoring and control
- Elysia server for web-based progress tracking
- State management using custom store

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details
