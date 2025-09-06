const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function generateCaptions({ imageBase64, context }) {
  if (!imageBase64) {
    throw new Error("imageBase64 is required");
  }

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  // Prepare image input
  const imagePart = {
    inlineData: {
      data: imageBase64,
      mimeType: "image/jpeg",
    },
  };

  // Create different prompts based on whether context is provided
  let prompt;

  if (context && context.trim()) {
    // Prompt for context-based captions - more directive and specific
    prompt = `
CONTEXT-BASED CAPTION GENERATION:

User's input/context: "${context.trim()}"

Your task:
1. Look at the image AND the user's context above
2. Generate 5 captions that blend BOTH the image content AND the user's context/theme
3. Each caption should reflect the user's intended mood, theme, or message
4. Make them feel personal and connected to what the user wrote

Rules:
- MUST incorporate elements from the user's context: "${context.trim()}"
- MUST be relevant to what's actually in the image
- Keep captions under 10 words each
- Make them social media friendly
- Output ONLY a JSON array, no other text

Example: If user wrote "weekend vibes" and image shows coffee:
["Weekend coffee rituals ☕", "Saturday morning energy", "Slow weekend moments", "Weekend fuel activated", "Chillin' with my brew"]

Generate 5 captions now:
`;
  } else {
    // Auto-generation prompt - focus on pure image analysis
    prompt = `
AUTO CAPTION GENERATION:

Analyze this image and generate 5 creative captions based ONLY on what you see.

Your task:
1. Identify key elements, mood, colors, objects, people, setting in the image
2. Create captions that describe or complement what's shown
3. Make them engaging and Instagram-worthy
4. Focus on the visual story the image tells

Rules:
- Base captions ONLY on image content (ignore any text that might be in the image)
- Make them creative and engaging
- Keep under 10 words each
- Use emojis sparingly (max 1 per caption)
- Output ONLY a JSON array, no other text

Generate 5 captions now:
`;
  }

  const result = await model.generateContent([prompt, imagePart]);

  let text = result.response.text().trim();

  // Remove ```json ... ``` wrappers if present
  text = text
    .replace(/```json/i, "")
    .replace(/```/g, "")
    .trim();

  let captions;
  try {
    captions = JSON.parse(text);

    // Ensure we have an array and limit to 5 captions
    if (!Array.isArray(captions)) {
      throw new Error("Response is not an array");
    }
    captions = captions.slice(0, 5);
  } catch (parseError) {
    console.log("JSON parse failed, using fallback:", parseError.message);

    // Fallback: split lines if Gemini didn't give valid JSON
    captions = text
      .split("\n")
      .map((c) =>
        c
          .replace(/^\d+\.\s*/, "") // Remove numbered list format
          .replace(/^["'\-\*]\s*/, "") // Remove quotes, dashes, asterisks
          .replace(/["']$/, "") // Remove trailing quotes
          .trim()
      )
      .filter(Boolean)
      .slice(0, 5);
  }

  // Ensure we have at least one caption
  if (!captions || captions.length === 0) {
    if (context && context.trim()) {
      // Context-based fallbacks
      captions = [
        `${context.trim()} vibes`,
        `Feeling ${context.trim().toLowerCase()}`,
        `${context.trim()} mood activated`,
        `Living that ${context.trim().toLowerCase()} life`,
        `${context.trim()} energy`,
      ];
    } else {
      // Auto-generate fallbacks
      captions = [
        "Picture perfect!",
        "Captured this moment!",
        "Making memories!",
        "Life in focus!",
        "Snapshot of joy!",
      ];
    }
  }

  return {
    captions,
    hasContext: !!(context && context.trim()),
  };
}

module.exports = { generateCaptions };
