/**
 * Commission Logic (60/40 Rule)
 * 
 * 100,000 Host Diamonds = 60,000 Withdrawal Points (60%) for the agent.
 * 
 * @param {number} diamonds - The raw amount of diamonds earned by the host.
 * @returns {number} - The conversion result in withdrawal points.
 */
export const convertDiamondsToPoints = (diamonds) => {
    if (!diamonds || typeof diamonds !== 'number') return 0;
    return Math.floor(diamonds * 0.6);
};

/**
 * Formats a number with commas for display.
 * @param {number} num 
 * @returns {string}
 */
export const formatCurrency = (num) => {
    return (num || 0).toLocaleString();
};
