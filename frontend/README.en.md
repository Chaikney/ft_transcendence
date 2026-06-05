# ft_transcendence - Frontend

This is the project's frontend, developed using a contract-oriented architecture, with a strong focus on unit and integration testing.

---

## ⚡ Daily Startup Workflow (Campus)
If you have already configured this computer, **you don't need to install anything**. You only need to reactivate the environment:

1. **Open terminal** in the `~/sgoinfre/ft_transcendence/frontend` folder.
2. **Activate Node.js:**

```bash
   nvm use --lts
````

3. **Verify dependencies:** If you performed a `git pull` and there are changes, run:
    
    Bash
    
    ```
    npm install
    ```
    
4. **Ready to work.**
    

## 🚀 Initial Setup (New computer or clean session)

Follow this **only the first time** you sit at a computer on campus.

### 1. Cleaning up ghost configurations

If there were previous sessions from other students, the `.zshrc` file might have corrupt paths.

Bash

```
unset NVM_DIR
nano ~/.zshrc
# Search and delete any line containing "nvm" or "NVM_DIR".
# Save with Ctrl+O, Enter and exit with Ctrl+X.
```

### 2. Installing NVM and Node.js

Bash

```
# Download and install NVM
curl -o- [https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh](https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh) | bash

# Reload terminal
source ~/.zshrc

# Install and activate the LTS version
nvm install --lts
nvm use --lts
```

### 3. Project Preparation

Bash

```
cd ~/sgoinfre/ft_transcendence/frontend
npm install
```

## 🛠️ Development Commands

|**Action**|**Command**|
|---|---|
|**Development**|`npm run dev`|
|**Build**|`npm run build`|
|**Preview**|`npm run preview`|

## 🧪 Testing Strategy

The testing strategy implemented in Vitest follows a solid **"testing pyramid"** approach.

To run the entire test suite and generate the coverage report, use:

Bash

```
npx vitest run --coverage
```

### Pyramid Levels

1. **L1 - Unit Tests:** Pure logic (`parseFen`, `toSquare`) and states (`matchStore`).
    
2. **L2 - Component Tests:** UI tests (`ChessBoard`, `SudokuBoard`) with `Testing Library` and `MSW`.
    
3. **L3 - Integration Tests:** Full flows (Hook + Store + Mock API).
    

## 🆘 Troubleshooting (Something not working?)

- **"zsh: command not found: npm"** or **"nvm"**:
    
    - Run `source ~/.zshrc`.
        
    - If it persists, run `nvm use --lts`.
        
- **Permissions or path errors:** - Check the `.zshrc` file with `nano ~/.zshrc` and ensure there are no duplicate or strange paths that were auto-generated.
    
- **Test fails due to "mock":**
    
    - Ensure the `.env` file or the `VITE_USE_MOCK` environment variable is configured correctly for what you want to test.