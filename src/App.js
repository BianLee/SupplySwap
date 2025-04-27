import React, { useState } from "react";
import "./App.css";

const initialRestaurants = [
  { id: 1, name: "Restaurant A", inventory: { apples: 10, bananas: 5, pears: 3 }, requests: [] },
  { id: 2, name: "Restaurant B", inventory: { apples: 3, bananas: 10, pears: 5 }, requests: [] },
  { id: 3, name: "Restaurant C", inventory: { apples: 5, bananas: 2, pears: 8 }, requests: [] },
];

// Available ingredients for dropdown selection
const availableIngredients = ["apples", "bananas", "pears"];

function App() {
  const [restaurants, setRestaurants] = useState(initialRestaurants);
  const [selectedRestaurantId, setSelectedRestaurantId] = useState(1);
  const [tradeRequest, setTradeRequest] = useState({ 
    ingredient: availableIngredients[0], 
    quantity: 1 
  });
  const [notification, setNotification] = useState({ message: "", type: "" });

  // Find current restaurant
  const selectedRestaurant = restaurants.find((r) => r.id === selectedRestaurantId);
  
  // Get other restaurants for trading
  const otherRestaurants = restaurants.filter((r) => r.id !== selectedRestaurantId);

  // Handle trade request input
  const handleRequestChange = (e) => {
    const { name, value } = e.target;
    setTradeRequest({
      ...tradeRequest,
      [name]: name === "quantity" ? parseInt(value, 10) || 0 : value,
    });
  };

  // Switch between restaurants
  const switchRestaurant = (id) => {
    setSelectedRestaurantId(id);
    // Reset notification when switching restaurants
    setNotification({ message: "", type: "" });
  };

  // Handle trade request submission
  const handleTradeRequest = () => {
    if (!tradeRequest.ingredient || tradeRequest.quantity <= 0) {
      showNotification("Please select an ingredient and provide a valid quantity", "error");
      return;
    }
    
    const updatedRestaurants = [...restaurants];
    const restaurantIndex = updatedRestaurants.findIndex((r) => r.id === selectedRestaurantId);
    
    // Check if there's already a request for this ingredient
    const existingRequestIndex = updatedRestaurants[restaurantIndex].requests.findIndex(
      r => r.ingredient === tradeRequest.ingredient
    );
    
    if (existingRequestIndex >= 0) {
      // Update existing request
      updatedRestaurants[restaurantIndex].requests[existingRequestIndex].quantity = tradeRequest.quantity;
      showNotification(`Updated request for ${tradeRequest.quantity} ${tradeRequest.ingredient}`, "success");
    } else {
      // Add new request
      updatedRestaurants[restaurantIndex].requests.push({...tradeRequest});
      showNotification(`Requested ${tradeRequest.quantity} ${tradeRequest.ingredient}`, "success");
    }
    
    setRestaurants(updatedRestaurants);
  };

  // Handle trade between restaurants
  const handleTrade = (targetRestaurantId, requestIndex) => {
    const updatedRestaurants = [...restaurants];
    const sourceRestaurantIndex = updatedRestaurants.findIndex(r => r.id === targetRestaurantId);
    const targetRestaurantIndex = updatedRestaurants.findIndex(r => r.id === selectedRestaurantId);
    
    const sourceRestaurant = updatedRestaurants[sourceRestaurantIndex];
    const targetRestaurant = updatedRestaurants[targetRestaurantIndex];
    const request = targetRestaurant.requests[requestIndex];
    
    // Check if source restaurant has enough inventory
    if (sourceRestaurant.inventory[request.ingredient] >= request.quantity) {
      // Execute the trade
      sourceRestaurant.inventory[request.ingredient] -= request.quantity;
      targetRestaurant.inventory[request.ingredient] += request.quantity;
      
      // Remove request after successful trade
      targetRestaurant.requests.splice(requestIndex, 1);
      
      showNotification(`Successfully traded ${request.quantity} ${request.ingredient} with ${sourceRestaurant.name}`, "success");
    } else {
      showNotification(`${sourceRestaurant.name} doesn't have enough ${request.ingredient}`, "error");
    }
    
    setRestaurants(updatedRestaurants);
  };

  // Delete a trade request
  const deleteRequest = (index) => {
    const updatedRestaurants = [...restaurants];
    const restaurantIndex = updatedRestaurants.findIndex((r) => r.id === selectedRestaurantId);
    updatedRestaurants[restaurantIndex].requests.splice(index, 1);
    setRestaurants(updatedRestaurants);
    showNotification("Request deleted", "success");
  };

  // Show notification
  const showNotification = (message, type) => {
    setNotification({ message, type });
    // Clear notification after 3 seconds
    setTimeout(() => {
      setNotification({ message: "", type: "" });
    }, 3000);
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1>KitchenCache</h1>
        <p>Restaurant Inventory Trading System</p>
      </header>

      {/* Restaurant Switcher */}
      <div className="restaurant-switcher">
        <h2>Select Restaurant</h2>
        <div className="restaurant-buttons">
          {restaurants.map((restaurant) => (
            <button
              key={restaurant.id}
              onClick={() => switchRestaurant(restaurant.id)}
              className={selectedRestaurantId === restaurant.id ? "active" : ""}
            >
              {restaurant.name}
            </button>
          ))}
        </div>
      </div>

      {notification.message && (
        <div className={`notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <div className="dashboard">
        <div className="left-panel">
          {/* Selected Restaurant */}
          <div className="restaurant-info">
            <h2>{selectedRestaurant.name}</h2>
            <div className="inventory-container">
              <h3>Current Inventory</h3>
              <div className="inventory-grid">
                {Object.keys(selectedRestaurant.inventory).map((ingredient) => (
                  <div key={ingredient} className="inventory-item">
                    <span className="ingredient-name">{ingredient}</span>
                    <span className="ingredient-count">{selectedRestaurant.inventory[ingredient]}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Trade Request Form */}
          <div className="trade-form">
            <h3>Create a Trade Request</h3>
            <div className="form-controls">
              <div className="form-group">
                <label htmlFor="ingredient">Ingredient:</label>
                <select
                  id="ingredient"
                  name="ingredient"
                  value={tradeRequest.ingredient}
                  onChange={handleRequestChange}
                >
                  {availableIngredients.map((ingredient) => (
                    <option key={ingredient} value={ingredient}>
                      {ingredient}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="quantity">Quantity:</label>
                <input
                  type="number"
                  id="quantity"
                  name="quantity"
                  min="1"
                  value={tradeRequest.quantity}
                  onChange={handleRequestChange}
                />
              </div>
              <button className="submit-button" onClick={handleTradeRequest}>
                Submit Request
              </button>
            </div>
          </div>
        </div>

        <div className="right-panel">
          {/* Pending Requests */}
          <div className="requests-container">
            <h3>Your Pending Requests</h3>
            {selectedRestaurant.requests.length === 0 ? (
              <p className="no-requests">No pending requests.</p>
            ) : (
              <ul className="requests-list">
                {selectedRestaurant.requests.map((req, index) => (
                  <li key={index} className="request-item">
                    <div className="request-info">
                      <span className="request-quantity">{req.quantity}</span>
                      <span className="request-ingredient">{req.ingredient}</span>
                    </div>
                    <div className="request-actions">
                      <button
                        className="delete-button"
                        onClick={() => deleteRequest(index)}
                      >
                        Cancel
                      </button>
                      <div className="trade-options">
                        {otherRestaurants.map((restaurant) => (
                          <button
                            key={restaurant.id}
                            className="trade-button"
                            onClick={() => handleTrade(restaurant.id, index)}
                            disabled={restaurant.inventory[req.ingredient] < req.quantity}
                          >
                            Trade with {restaurant.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Other Restaurants Inventory */}
          <div className="other-restaurants">
            <h3>Other Restaurants Inventory</h3>
            <div className="other-inventory-grid">
              {otherRestaurants.map((restaurant) => (
                <div key={restaurant.id} className="other-restaurant-card">
                  <h4>{restaurant.name}</h4>
                  <div className="inventory-list">
                    {Object.entries(restaurant.inventory).map(([ingredient, count]) => (
                      <div key={ingredient} className="inventory-row">
                        <span>{ingredient}:</span>
                        <span 
                          className={count < 3 ? "low-stock" : ""}
                        >
                          {count}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;