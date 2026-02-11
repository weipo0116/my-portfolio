#!/bin/
# 執行前：
# chmod +x setup_env.sh

# --- 參數設定 (可根據需求修改預設值) ---
ENV_NAME=${1:-"portfolio_env"}
NODE_VERSION=${2:-"20"}
PROJECT_DIR=${3:-"~/Desktop/my-portfolio"}

echo "開始建立環境: $ENV_NAME (Node.js $NODE_VERSION)"

# 1. 建立 Conda 環境
conda create -n "$ENV_NAME" nodejs="$NODE_VERSION" -c conda-forge -y

# 2. 進入專案目錄
# 使用 eval 處理路徑中的波浪號 (~)
eval PROJECT_DIR_EXPANDED=$PROJECT_DIR
cd "$PROJECT_DIR_EXPANDED" || { echo "找不到路徑: $PROJECT_DIR"; exit 1; }

# 3. 安裝依賴 (需在環境啟用狀態或指定路徑執行)
# 註：在 script 中直接使用 conda activate 有時會失效，建議使用 conda run
conda run -n "$ENV_NAME" npm install

echo "環境設定完成！請手動執行 'conda activate $ENV_NAME' 開始開發。"