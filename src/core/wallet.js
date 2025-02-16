import { ethers } from "ethers";
import Network from "./network.js";
import Tools from "../utils/tools.js";
import Client from "../services/client.js";
import Display from "../utils/display.js";
import fs from "fs/promises";

const loadConfig = async () => {
  const configFile = await fs.readFile(
    new URL("../../config.json", import.meta.url)
  );
  return JSON.parse(configFile);
};

class WalletManager extends Client {
  constructor(privateKey) {
    super();
    this.privateKey = privateKey;
    this.provider = new ethers.JsonRpcProvider(Network.RPCURL, Network.CHAINID);
    this.config = null;
    this.user = null;
    this.token = null;
    this.wallet = null;
    this.address = null;
    this.activeMatches = {};
    this.sessionCount = 0;
    this.lastSessionTime = null;
    this.currentAgentIndex = 0;
  }

  async checkProxyIP() {
    try {
        await this.updateProxy();
        const ip = await this.getCurrentIP();
    } catch (error) {
        Display.log("❌ Failed to fetch proxy IP:", error.message);
    }
  }

  async initialize() {
    this.config = await loadConfig();
    await this.checkProxyIP();
  }


  async connect() {
    try {
      if (!this.config) {
        await this.initialize();
      }

      await Tools.delay(1000, "Connecting to wallet...");
      
      this.wallet = new ethers.Wallet(this.privateKey.trim(), this.provider);
      

      this.address = this.wallet.address;
      await Tools.delay(1000, `Connected to ${this.address.slice(0, 6)}...${this.address.slice(-4)}`);

      await this.checkProxyIP();
    } catch (error) {
      throw error;
    }
  }

  async getBalance() {
    try {
      await Tools.delay(500, `Getting balance for ${this.address.slice(0, 6)}...${this.address.slice(-4)}`);
      const balance = ethers.formatEther(
        await this.provider.getBalance(this.address)
      );
      this.balance = { ETH: balance };
      await Tools.delay(500, "Balance updated");
    } catch (error) {
      throw error;
    }
  }

  async login(retryCount = 0, maxRetries = 3) {
    try {
      await Tools.delay(500, "Connecting to Fraction AI");

      const delayTime = Math.min(2000 * Math.pow(2, retryCount), 30000);
      if (retryCount > 0) {
        await Tools.delay(
          delayTime,
          `Retry attempt ${retryCount}/${maxRetries}`
        );
      }

      const nonceResponse = await this.fetch("/auth/nonce");
      const nonce = nonceResponse.data.nonce;

      const message =
        "dapp.fractionai.xyz wants you to sign in with your Ethereum account:\n" +
        this.address +
        "\n\nSign in with your wallet to Fraction AI.\n\nURI: https://dapp.fractionai.xyz\nVersion: 1\nChain ID: 11155111\nNonce: " +
        nonce +
        "\nIssued At: " +
        new Date().toISOString();

      const signature = await this.wallet.signMessage(message);

      const authResponse = await this.fetch("/auth/verify", "POST", undefined, {
        message,
        signature,
        referralCode: Tools.generateRef(),
      });

      if (authResponse.status !== 200 || !authResponse.data) {
        if (
          retryCount < maxRetries &&
          (authResponse.status === 502 || authResponse.status === 504)
        ) {
          return this.login(retryCount + 1, maxRetries);
        }

        if (authResponse.status === 429) {
          const waitTime = 60 * 1000;
          Tools.log("Rate limit hit (429). Waiting 1 minute before retry...");
          await Tools.delay(waitTime, "Waiting for rate limit cooldown...");
          return this.login(retryCount, maxRetries);
        }

        throw new Error(
          `Authentication failed: ${
            authResponse.data?.error || authResponse.status
          }`
        );
      }

      this.user = authResponse.data.user;
      this.token = authResponse.data.accessToken;

      await Tools.delay(500, "Connected to Fraction AI");
    } catch (error) {
      if (error.message.includes("502") && retryCount < maxRetries) {
        return this.login(retryCount + 1, maxRetries);
      }

      if (error.message.includes("429")) {
        const waitTime = 60 * 1000;
        Tools.log("Rate limit hit (429). Waiting 1 minute before retry...");
        await Tools.delay(waitTime, "Waiting for rate limit cooldown...");
        return this.login(retryCount, maxRetries);
      }

      throw new Error(`Login failed: ${error.message}`);
    }
  }

  async getAgents() {
    try {
      await Tools.delay(500, "Getting agents list");

      const response = await this.fetch(
        `/agents/user/${this.user.id}`,
        "GET",
        this.token
      );

      // console.log("Agentlist: ", response)

      if (response.status !== 200 || !response.data) {
        throw new Error("Failed to fetch agents");
      }

      this.agents = Array.isArray(response.data) ? response.data : [];
      await Tools.delay(500, `Retrieved ${this.agents.length} agents`);

      const display = Display.getInstance();
      if (display) {
        display.updateAgents(this.agents, this.activeMatches);
      }
    } catch (error) {
      throw error;
    }
  }

  async getSessions() {
    try {
      await Tools.delay(500, "Getting sessions list");

      const response = await this.fetch(
        "/session-types/list",
        "GET",
        this.token
      );

      if (response.status !== 200 || !response.data) {
        throw new Error("Failed to fetch sessions");
      }

      this.sessions = Array.isArray(response.data) ? response.data : [];
      await Tools.delay(500, `Retrieved ${this.sessions.length} sessions`);
    } catch (error) {
      throw error;
    }
  }

  async getFractalInfo() {
    try {
      await Tools.delay(500, "Getting fractal info");

      const response = await this.fetch(
        `/rewards/fractal/user/${this.user.id}`,
        "GET",
        this.token
      );

      if (response.status !== 200 || !response.data) {
        throw new Error("Failed to fetch fractal info");
      }

      this.fractalInfo = response.data;
      const display = Display.getInstance();
      if (display) {
        display.updateFractalInfo(this.fractalInfo);
      }
      await Tools.delay(500, "Fractal info updated");
    } catch (error) {
      throw error;
    }
  }

  async processAgents() {
    if (this.agents.length === 0) {
      await Tools.delay(
        10000,
        "No agents available. Please create an agent first"
      );
      throw new Error("No agents available");
    }

    if (
      this.lastSessionTime &&
      Date.now() - this.lastSessionTime >= 60 * 60 * 1000
    ) {
      this.sessionCount = 0;
    }

    if (this.sessionCount >= 6) {
      const waitTime = 60 * 60 * 1000 - (Date.now() - this.lastSessionTime);
      if (waitTime > 0) {
        await Tools.delay(
          waitTime,
          `Session limit reached. Waiting for cooldown: ${Math.ceil(
            waitTime / 60000
          )} minutes`
        );
        this.sessionCount = 0;
      }
    }

    for (let i = 0; i < this.agents.length; i++) {
      const agentIndex = (this.currentAgentIndex + i) % this.agents.length;
      const agent = this.agents[agentIndex];

      for (const session of this.sessions) {
        if (agent.sessionType.sessionType === session.sessionType.sessionType) {
          if (!agent.automationEnabled && this.sessionCount < 6) {
            try {
              await this.startMatch(agent, session);
              this.sessionCount++;
              this.lastSessionTime = this.lastSessionTime || Date.now();
              this.currentAgentIndex = (agentIndex + 1) % this.agents.length;
            } catch (error) {
              if (error.message.includes("maximum number of sessions")) {
                this.sessionCount = 6;
                this.lastSessionTime = Date.now();
                throw error;
              }
              throw error;
            }
          }
        }
      }
    }

    let waitTime = 180;
    for (const session of this.sessions) {
      const duration =
        session.sessionType.durationPerRound * session.sessionType.rounds;
      if (duration < waitTime) waitTime = duration;
    }

    await Tools.delay(
      waitTime * 1000,
      `Processing completed. Waiting for ${Tools.msToTime(waitTime * 1000)}`
    );
  }

  async checkAgentStatus(agent) {
    try {
      const response = await this.fetch(
        `/agents/user/${this.user.id}/${agent.id}/status`,
        "GET",
        this.token
      );

      if (response.status === 200 && response.data) {
        return response.data.inQueue || false;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  async startMatch(agent, session) {
    try {
      if (!this.config) {
        await this.initialize();
      }

      const isInQueue = await this.checkAgentStatus(agent);
      if (isInQueue) {
        Tools.log(`Agent ${agent.name} is already in queue`);
        return false;
      }

      await Tools.delay(
        2000,
        `Starting match: Agent ${agent.name} - Session ${session.sessionType.name}`
      );

      const response = await this.fetch(
        "/matchmaking/initiate",
        "POST",
        this.token,
        {
          userId: this.user.id,
          agentId: agent.id,
          entryFees: this.config.fee,
          sessionTypeId: session.sessionType.id,
        }
      );

      if (response.status === 200) {
        this.activeMatches[agent.id] = true;
        Tools.updateDisplay(this);
        await Tools.delay(
          500,
          `Match started: ${agent.name} - ${session.sessionType.name}`
        );
        return true;
      } else if (response.data?.error?.includes("already in queue")) {
        this.activeMatches[agent.id] = true;
        Tools.updateDisplay(this);
        Tools.log(`Agent ${agent.name} is already in active match`);
        return false;
      } else {
        throw new Error(response.data?.error || "Failed to start match");
      }
    } catch (error) {
      throw error;
    }
  }

  async executeTx(txData) {
    try {
      await Tools.delay(500, "Executing transaction...");
      const txResponse = await this.wallet.sendTransaction(txData);
      await Tools.delay(500, "Waiting for transaction confirmation...");
      const txReceipt = await txResponse.wait();
      await Tools.delay(
        500,
        `Transaction confirmed: ${Network.EXPLORER}tx/${txReceipt.hash}`
      );
      await this.getBalance();
      return txReceipt;
    } catch (error) {
      if (error.message.includes("504")) {
        await Tools.delay(5000, error.message);
      } else {
        throw error;
      }
    }
  }

  async getNonce() {
    try {
      const latestNonce = await this.provider.getTransactionCount(
        this.wallet.address,
        "latest"
      );
      const pendingNonce = await this.provider.getTransactionCount(
        this.wallet.address,
        "pending"
      );
      return Math.max(pendingNonce, latestNonce);
    } catch (error) {
      throw error;
    }
  }

  async estimateGas(
    txData,
    value = 0,
    isFeatureEnabled = false,
    maxRetries = 3
  ) {
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const estimatedGas = await this.provider.estimateGas({
          from: this.wallet.address,
          to: txData.to,
          value: value,
          data: txData.data,
        });
        return estimatedGas;
      } catch (error) {
        if (isFeatureEnabled) throw error;

        await Tools.delay(
          3000,
          `Gas estimation failed. Attempt ${attempt + 1}/${maxRetries}`
        );

        if (attempt === maxRetries - 1) {
          throw new Error(
            `Failed to estimate gas after ${maxRetries} attempts`
          );
        }
      }
    }
  }

  async buildTx(txData, isFeatureEnabled = false, value = 0) {
    const nonce = await this.getNonce();
    const gasLimit = await this.estimateGas(txData, value, isFeatureEnabled);

    return {
      to: txData.to,
      from: this.address,
      value: value,
      gasLimit: gasLimit,
      gasPrice: ethers.parseUnits("1.5", "gwei"),
      nonce: nonce,
      data: txData.data,
    };
  }
}

export default WalletManager;
