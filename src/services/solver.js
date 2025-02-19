import ac from "@antiadmin/anticaptchaofficial";
import fetch from "node-fetch";
import Tools from "../utils/tools.js";

class Solver {
  constructor(apiKey) {
    this.initialize(apiKey);
  }

  initialize(apiKey) {
    if (!apiKey) {
      throw new Error("AntiCaptcha API key is required");
    }
    ac.setAPIKey(apiKey);
    ac.setSoftId(0);
    Tools.log("AntiCaptcha initialized successfully");
  }

  async downloadImage(imageUrl) {
    try {
      Tools.log(`Downloading captcha from: ${imageUrl}`);
      const imageResponse = await fetch(imageUrl);
      if (!imageResponse.ok) {
        throw new Error(
          `Failed to download image: ${imageResponse.statusText}`
        );
      }
      const imageBuffer = await imageResponse.buffer();
      const base64Image = imageBuffer.toString("base64");
      Tools.log("Image converted to base64");
      return base64Image;
    } catch (error) {
      Tools.log(`Error downloading image: ${error.message}`);
      throw error;
    }
  }

  async solve(imageUrl, retryCount = 0, maxRetries = 3) {
    try {
      if (!imageUrl) {
        throw new Error("No captcha image URL provided");
      }

      if (retryCount > 0) {
        const delayTime = Math.min(2000 * Math.pow(2, retryCount), 30000);
        await Tools.delay(
          delayTime,
          `Retry attempt ${retryCount}/${maxRetries}`
        );
      }

      const base64Image = await this.downloadImage(imageUrl);

      Tools.log("Creating captcha task...");
      const result = await ac.solveImage(base64Image, {
        numeric: 0,
        minLength: 5,
        maxLength: 6,
        phrase: 0,
        case: 0,
        math: 0,
        comment: "Fraction AI Captcha",
      });

      if (!result) {
        throw new Error("Failed to solve captcha");
      }

      Tools.log(`Captcha solved successfully: ${result}`);
      return result;
    } catch (error) {
      if (retryCount < maxRetries) {
        Tools.log(`Captcha error: ${error.message}. Retrying...`);
        return this.solve(imageUrl, retryCount + 1, maxRetries);
      }

      Tools.log(`Max retries (${maxRetries}) reached. Error: ${error.message}`);
      throw error;
    }
  }

  reportGood() {
    try {
    //   ac.reportCorrect();
      Tools.log("Reported correct captcha solution");
    } catch (error) {
      Tools.log(`Error reporting correct solution: ${error.message}`);
    }
  }

  reportBad() {
    try {
    //   ac.reportIncorrect();
      Tools.log("Reported incorrect captcha solution");
    } catch (error) {
      Tools.log(`Error reporting incorrect solution: ${error.message}`);
    }
  }

  dispose() {
    try {
      Tools.log("Solver disposed");
    } catch (error) {
      Tools.log(`Error disposing solver: ${error.message}`);
    }
  }
}

export default Solver;
