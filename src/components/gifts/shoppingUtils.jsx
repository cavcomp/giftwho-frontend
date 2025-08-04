
import { InvokeLLM } from "@/api/integrations";

export const findSingleCategoryOption = async (gift, contact, targetCategory) => {
  const age = contact.birthday ? new Date().getFullYear() - new Date(contact.birthday).getFullYear() : 30;
  const budget = gift.budget || 50;
  const preferences = contact.preferences || {};

  const categoryMap = {
    'electronics': 'Electronics/Tech',
    'fashion': 'Fashion/Accessories',
    'home': 'Home/Living',
    'books': 'Books/Media',
    'health': 'Health/Beauty',
    'outdoors': 'Outdoors/Sports',
    'toys': 'Toys/Games'
  };
  const categoryDescription = categoryMap[targetCategory] || 'General items';

  const prompt = `
You are a world-class personal shopper AI. Your goal is to find the best possible gift idea in the "${categoryDescription}" category for a ${age}-year-old ${contact.gender || 'person'}.

**Search Directives & Constraints:**
1.  **Budget Priority:** The budget is a strict maximum of $${budget}. You MUST prioritize finding the **lowest-cost option** available that meets all criteria.
2.  **Relevance is Key:** The gift must be highly relevant to their interests: ${preferences.hobbies?.join(', ') || 'general interests'}.
3.  **Trending & Popular:** The item should be currently trending, popular, or highly-rated for the recipient's age group.
4.  **Age Appropriateness:** The gift must be suitable for a ${age}-year-old.

**Your Task:**
Find exactly 1 specific product gift idea that follows all the directives above.

**Output Requirements:**
- **CRITICAL: Do NOT provide any URLs or links. Only provide product details.**
- For the product, provide:
  - Specific product name with brand and model.
  - A compelling reason why it's a perfect match, linking it to their specific interests.
  - Your best estimate for the lowest-cost price, which must be within the $${budget} budget.
  - The best search terms to find this exact product online.

Format the output as JSON:
{
  "options": [
    {
      "title": "Specific Product Name - Brand and Model",
      "description": "Why this is perfect for them based on their interests",
      "category": "${targetCategory}",
      "target_interest": "The specific hobby this matches",
      "estimated_price": 45.99,
      "key_features": ["Feature 1", "Feature 2", "Feature 3"],
      "search_terms": "Brand Model Name exact product"
    }
  ]
}
`;

  try {
    const response = await InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          options: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                category: { type: "string" },
                target_interest: { type: "string" },
                estimated_price: { type: "number" },
                key_features: { type: "array", items: { type: "string" } },
                search_terms: { type: "string" }
              },
              required: ["title", "description", "category", "search_terms"]
            }
          }
        }
      }
    });

    if (!response?.options) {
      return [];
    }

    const convertedOptions = response.options.map(option => ({
      ...option,
      gift_id: gift.id,
      current_price: option.estimated_price,
      needs_manual_link: true, // All AI suggestions now require manual linking
      store_name: null,
      store_url: null
    }));

    return convertedOptions;

  } catch (error) {
    console.error("Error finding product recommendations:", error);
    return [];
  }
};

export const findAndNotifyShoppingOptions = async (gift, contact) => {
  const age = contact.birthday ? new Date().getFullYear() - new Date(contact.birthday).getFullYear() : 30;
  const budget = gift.budget || 50;
  const preferences = contact.preferences || {};

  const prompt = `
You are a world-class personal shopper AI. Your goal is to find the best possible gift ideas for a ${age}-year-old ${contact.gender || 'person'}.

**Search Directives & Constraints:**
1.  **Budget Priority:** The budget is a strict maximum of $${budget} per item. You MUST prioritize finding the **lowest-cost options** available that meet the user's criteria.
2.  **Relevance is Key:** Each gift must be highly relevant to their interests: ${preferences.hobbies?.join(', ') || 'general interests'}.
3.  **Trending & Popular:** Focus on items that are currently trending, popular, or highly-rated for the recipient's age and gender.
4.  **Age Appropriateness:** All gifts must be suitable for a ${age}-year-old.

**Your Task:**
Find 4-5 specific product gift ideas that follow all the directives above, covering different categories like electronics, fashion, home goods, books, sports, etc.

**Output Requirements:**
- **CRITICAL: Do NOT provide any URLs or links. Only provide product details.**
- For each product, provide:
  - Specific product name with brand and model.
  - A compelling reason why it's a perfect match, linking it to their specific interests.
  - Your best estimate for the lowest-cost price, which must be within the $${budget} budget.
  - A relevant category.
  - Key features that make it special.
  - The best search terms to find this exact product online.

Format the output as JSON:
{
  "options": [
    {
      "title": "Specific Product Name - Brand and Model",
      "description": "Why this is perfect for them based on their interests",
      "category": "electronics",
      "target_interest": "The specific hobby this matches",
      "estimated_price": 45.99,
      "key_features": ["Feature 1", "Feature 2", "Feature 3"],
      "search_terms": "Brand Model Name exact product"
    }
  ]
}
`;

  try {
    const response = await InvokeLLM({
      prompt: prompt,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          options: {
            type: "array",
            items: {
              type: "object",
              properties: {
                title: { type: "string" },
                description: { type: "string" },
                category: { type: "string" },
                target_interest: { type: "string" },
                estimated_price: { type: "number" },
                key_features: { type: "array", items: { type: "string" } },
                search_terms: { type: "string" }
              },
              required: ["title", "description", "category", "search_terms"]
            }
          }
        }
      }
    });

    if (!response?.options) {
      return [];
    }

    const convertedOptions = response.options.map(option => ({
      ...option,
      gift_id: gift.id,
      current_price: option.estimated_price,
      needs_manual_link: true, // All AI suggestions now require manual linking
      store_name: null,
      store_url: null
    }));

    return convertedOptions;

  } catch (error) {
    console.error("Error finding product recommendations:", error);
    return [];
  }
};
