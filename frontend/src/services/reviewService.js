import API from './api';

export const reviewService = {
  async getRecipeReviews(recipeId) {
    const res = await API.get(`/reviews/recipe/${recipeId}`);
    return res.data;
  },

  async addOrUpdateReview(recipeId, reviewData) {
    const res = await API.post(`/reviews/recipe/${recipeId}`, reviewData);
    return res.data;
  },

  async deleteReview(reviewId) {
    const res = await API.delete(`/reviews/${reviewId}`);
    return res.data;
  },
};

export default reviewService;
