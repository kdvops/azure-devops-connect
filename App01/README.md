# Azure DevOps Connect 🔗

A **Jira Forge app** that connects Jira issues with Azure DevOps repositories.

## ✨ Features

- 🎯 **Create branches from Jira issues** — one click to create `feature/SCRUM-42-name` branches
- 📋 **Track branches** — see linked branches directly on the Jira issue panel
- 🔄 **Create Pull Requests** — quick link to create PRs from the issue
- ⚙️ **Configurable** — choose which Azure DevOps project and repository to use

## 🚀 How it Works

1. Open any Jira issue
2. The **Azure DevOps** panel appears on the right side
3. Configure your Azure DevOps connection (one-time setup)
4. Click **"Create Branch"** — a branch is created in your repo
5. The panel shows the branch status, with options to open in Azure DevOps or create a PR

## 🛠️ Setup

### Prerequisites

- [Node.js 18+](https://nodejs.org/)
- [Forge CLI](https://developer.atlass.com/platform/forge/getting-started/)
  ```bash
  npm install -g @forge/cli
  ```
- Access to a Jira Cloud instance
- Azure DevOps organization with a repository

### Installation

```bash
# Clone the repo
git clone https://github.com/kdvops/azure-devops-connect.git
cd azure-devops-connect

# Install dependencies
npm install

# Login to Forge
forge login

# Create the Forge app
forge register

# Deploy to development environment
forge deploy

# Install in your Jira site
forge install
```

### Azure DevOps PAT

1. Go to `https://dev.azure.com/{your-org}/_usersSettings/tokens`
2. Create a PAT with **Code (Read & Write)** scope
3. When configuring the app in Jira, enter the PAT in the settings panel

## 🏗️ Project Structure

```
azure-devops-connect/
├── manifest.yml             # Forge app manifest
├── package.json             # Dependencies
├── src/
│   ├── index.jsx            # UI Kit issue panel (frontend + backend resolvers)
│   └── azure-client.js      # Azure DevOps API helpers
├── static/
│   └── icon.svg             # App icon
└── README.md
```

## 🔧 Configuration

In the Jira issue panel, click **"Configure Connection"** and enter:

| Field | Description | Example |
|---|---|---|
| Organization | Azure DevOps org name | `the-punisher01` |
| Project | Azure DevOps project | `MyProject` |
| Repository | Git repository name | `my-repo` |
| Source Branch | Branch to branch from | `main` |
| PAT | Personal Access Token | *(your PAT)* |

## 🧪 Development

```bash
# Run locally with tunnel
forge tunnel

# Deploy updates
forge deploy

# View logs
forge logs
```

## 🔐 Security

- Azure DevOps PAT is stored securely in Forge's encrypted storage
- No credentials are exposed in the Jira UI
- All API calls are made server-side via Forge's runtime

## 📄 License

MIT
