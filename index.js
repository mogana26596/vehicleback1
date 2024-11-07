const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const dataFilePath = path.join(__dirname, 'data.json');

// Function to move each vehicle to the next point on its route
function updateVehiclePositions(vehicles) {
    return vehicles.map(vehicle => {
        if (vehicle.route && vehicle.route.length > 0) {
            // Move to the next waypoint in the route
            vehicle.currentIndex = (vehicle.currentIndex + 1) % vehicle.route.length;
            vehicle.lat = vehicle.route[vehicle.currentIndex].lat;
            vehicle.lng = vehicle.route[vehicle.currentIndex].lng;
        }
        return vehicle;
    });
}

// Endpoint to get and update vehicle data
app.get('/vehicles', (req, res) => {
    fs.readFile(dataFilePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Failed to read vehicle data.' });
            return;
        }
        let vehicles = JSON.parse(data);

        // Update positions along the route
        vehicles = updateVehiclePositions(vehicles);

        // Save the updated vehicle positions to data.json
        fs.writeFile(dataFilePath, JSON.stringify(vehicles, null, 2), (err) => {
            if (err) {
                res.status(500).json({ error: 'Failed to update vehicle data.' });
                return;
            }
            res.json(vehicles);
        });
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
