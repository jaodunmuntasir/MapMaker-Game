const gameBoard = document.getElementById('game-board');
const supplyBox = document.getElementById('supply-box');
const rotateButton = document.getElementById('rotate-button');
const flipButton = document.getElementById('flip-button');
const timeUnitDisplay = document.getElementById('time-unit-display');

// score display elements
//const scoreDisplay = document.getElementById('score-display');
const finalScoreDisplay = document.getElementById('final-score-display');

const elements = ['forest', 'village', 'plains', 'water', 'mountain'];
const shapes = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];

const shapeTimeUnits = { 'I': 1, 'O': 1, 'T': 1, 'S': 0, 'Z': 0, 'J': 1, 'L': 0 };
const elementTimeUnits = { 'forest': 1, 'village': 2, 'plains': 1, 'water': 2, 'mountain': 0 };

let totalTimeUnits = 0;
let isGameOver = false;
let currentSeason = 'Spring';
let seasonScores = { 'Spring': 0, 'Summer': 0, 'Autumn': 0, 'Winter': 0 };
let finalScore = 0;


const shapeLayouts = {
    'I': [[0, 0], [1, 0], [2, 0], [3, 0]],
    'O': [[0, 0], [0, 1], [1, 0], [1, 1]],
    'T': [[0, 1], [1, 1], [2, 1], [1, 0]],
    'S': [[0, 1], [1, 1], [1, 0], [2, 0]],
    'Z': [[0, 0], [1, 0], [1, 1], [2, 1]],
    'J': [[0, 0], [0, 1], [1, 1], [2, 1]],
    'L': [[2, 0], [0, 1], [1, 1], [2, 1]],
};

// Generate the game board
for (let i = 0; i < 121; i++) {
    const cell = document.createElement('div');
    gameBoard.appendChild(cell);
}

// Fixed mountain positions
const mountainPositions = [
    { row: 1, col: 1 },
    { row: 3, col: 8 },
    { row: 5, col: 3 },
    { row: 8, col: 9 },
    { row: 9, col: 5 }
];

// Place mountains at the specified positions
mountainPositions.forEach(position => {
    const cellIndex = position.row * 11 + position.col;
    const mountainImg = createImageElement('mountain');
    gameBoard.children[cellIndex].appendChild(mountainImg);
});

//['Spring', 'Summer', 'Autumn', 'Winter'].forEach(season => displaySeasonScorebox(season));

function createImageElement(element, shapeType) {
    const img = document.createElement('img');
    img.src = `D:\\Programming Language Software Library\\JavaScript Files\\Assignment1_v2\\assignment_assets\\assets\\tiles\\${element}.png`;
    img.classList.add(element);
    img.dataset.shape = shapeType;
    return img;
}

function generateRandomShape(element) {
    const randomShapeType = shapes[Math.floor(Math.random() * shapes.length)];
    return { type: randomShapeType, element: element, layout: shapeLayouts[randomShapeType] };
}

let selectedShape = null;
let currentShapeInSupplyBox = null;

// supplyBox.addEventListener('click', (e) => {
//     if (e.target.tagName === 'IMG' && !selectedShape) {
//         const shapeType = e.target.dataset.shape;
//         const elementType = e.target.classList[0];
//         selectedShape = { type: shapeType, element: elementType, layout: shapeLayouts[shapeType] };
//     }
// });

gameBoard.addEventListener('click', (e) => {
    if (selectedShape && !isGameOver && e.target.tagName === 'DIV' && e.target.children.length === 0) {  // Check if game is over
        const layout = selectedShape.layout;
        const element = selectedShape.element;

        const cellIndex = Array.from(gameBoard.children).indexOf(e.target);
        const row = Math.floor(cellIndex / 11);
        const col = cellIndex % 11;

        const canPlace = layout.every(([dx, dy]) => {
            const newRow = row + dx;
            const newCol = col + dy;
            if (newRow >= 0 && newRow < 11 && newCol >= 0 && newCol < 11) {
                const targetCell = gameBoard.children[newRow * 11 + newCol];
                return targetCell && targetCell.children.length === 0;
            }
            return false;
        });

        if (canPlace) {
            layout.forEach(([dx, dy]) => {
                const targetCell = gameBoard.children[(row + dx) * 11 + (col + dy)];
                const img = createImageElement(element, selectedShape.type);
                targetCell.appendChild(img);
                // Track the new element's position
                elementsPlaced[currentSeason].push({ row: row + dx, col: col + dy, element: element });
            });
            selectedShape = null;
            currentShapeInSupplyBox = null;
            generateNewShapeInSupplyBox();
        
            // Update the season and scores after a shape is placed
            updateSeasonAndScore();
            updateMissionScores();
        }
        
    }
});

function generateNewShapeInSupplyBox() {
    while (supplyBox.firstChild) {
        supplyBox.removeChild(supplyBox.firstChild);
    }

    if (!currentShapeInSupplyBox && !isGameOver) {  // Check if game is over
        let randomElement = elements[Math.floor(Math.random() * 4)];
        let randomShapeType = shapes[Math.floor(Math.random() * shapes.length)];
        currentShapeInSupplyBox = { type: randomShapeType, element: randomElement, layout: shapeLayouts[randomShapeType] };
        totalTimeUnits += shapeTimeUnits[randomShapeType] + elementTimeUnits[randomElement];
        timeUnitDisplay.textContent = `Time Units: ${totalTimeUnits}`;

        if (totalTimeUnits >= 28) {
            alert("Game Over!");
            isGameOver = true;  // Set game over flag
        }
    }

    const shape = currentShapeInSupplyBox;

    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 4; j++) {
            const cell = document.createElement('div');
            supplyBox.appendChild(cell);
        }
    }

    // Set the selectedShape to the newly generated shape
    selectedShape = currentShapeInSupplyBox;

    // // Update time cost display for the current shape
    // const shapeCost = shapeTimeUnits[currentShapeInSupplyBox.type] + elementTimeUnits[currentShapeInSupplyBox.element];
    // document.getElementById('shape-time-cost').textContent = `${shapeCost}`;

    shape.layout.forEach(([dx, dy]) => {
        const cellIndex = dx * 4 + dy;
        const img = createImageElement(shape.element, shape.type);
        supplyBox.children[cellIndex].appendChild(img);
    });

    updateSeasonAndScore();
    updateMissionScores();
}

// Offset the shape to fit into the 4x4 grid
function offsetShape(shape) {
    const offsetX = Math.min(...shape.layout.map(([x, _]) => x));
    const offsetY = Math.min(...shape.layout.map(([_, y]) => y));
    const offsetLayout = shape.layout.map(([x, y]) => [x - offsetX, y - offsetY]);
    return { ...shape, layout: offsetLayout };
}

// Rotate the shape 90 degrees clockwise
function rotateShape(shape) {
    const rotatedLayout = shape.layout.map(([x, y]) => [y, -x]);
    return offsetShape({ ...shape, layout: rotatedLayout });
}

// Flip the shape horizontally
function flipShape(shape) {
    const flippedLayout = shape.layout.map(([x, y]) => [-x, y]);
    return offsetShape({ ...shape, layout: flippedLayout });
}

rotateButton.addEventListener('click', () => {
    if (currentShapeInSupplyBox && !isGameOver) {  // Check if game is over
        currentShapeInSupplyBox = rotateShape(currentShapeInSupplyBox);
        selectedShape = currentShapeInSupplyBox;
        generateNewShapeInSupplyBox();
    }
});

flipButton.addEventListener('click', () => {
    if (currentShapeInSupplyBox && !isGameOver) {  // Check if game is over
        currentShapeInSupplyBox = flipShape(currentShapeInSupplyBox);
        selectedShape = currentShapeInSupplyBox;
        generateNewShapeInSupplyBox();
    }
});

// Function to update the current season and calculate the score
function updateSeasonAndScore() {
    const previousSeason = currentSeason;

    // Determine the current season based on time units
    if (totalTimeUnits >= 7 && totalTimeUnits < 14) currentSeason = 'Summer';
    else if (totalTimeUnits >= 14 && totalTimeUnits < 21) currentSeason = 'Autumn';
    else if (totalTimeUnits >= 21) currentSeason = 'Winter';

    if (previousSeason !== currentSeason) {
        resetElementsPlacedForSeason(previousSeason);
        calculateSeasonScore(previousSeason);
        //displaySeasonScore(previousSeason);
        // Reset mission scores
        resetMissionScores();
    }    

    // Show popup for the last season before checking for game over
    if (previousSeason !== currentSeason || totalTimeUnits >= 28) {
        calculateSeasonScore(previousSeason);
        displaySeasonScorebox(previousSeason);
        displaySeasonScorePopup(previousSeason); // Show popup for the previous season
    }

    // Update the current season display
    document.getElementById('current-season').textContent = `(${currentSeason})`;

    // Determine active missions for each season
    let activeMissions = [];
    switch (currentSeason) {
        case 'Spring':
            activeMissions = ['Edge_of_the_forest', 'Sleepy_valley'];
            break;
        case 'Summer':
            activeMissions = ['Sleepy_valley', 'Watering_potatoes'];
            break;
        case 'Autumn':
            activeMissions = ['Watering_potatoes', 'Borderlands'];
            break;
        case 'Winter':
            activeMissions = ['Borderlands', 'Edge_of_the_forest'];
            break;
    }
    updateActiveMissions(activeMissions);

    // Check for game over and display final score
    if (totalTimeUnits >= 28) {
        calculateFinalScore();
        displayFinalScore();
        isGameOver = true; // End the game
        alert(`Final Score: ${finalScore}`); // Moved here to ensure it shows after the season popup
    }

    updateExtraMissionsScore();
}


function resetMissionScores() {
    document.getElementById('score-mission-1').textContent = `Mission 1 Score: 0`;
    document.getElementById('score-mission-2').textContent = `Mission 2 Score: 0`;
}

function updateMissionScores() {
    let score1 = 0, score2 = 0;

    switch (currentSeason) {
        case 'Spring':
            score1 = calculateEdgeOfTheForestScore();
            score2 = calculateSleepyValleyScore();
            document.getElementById('score-Edge_of_the_forest').textContent = `${score1} points`;
            document.getElementById('score-Sleepy_valley').textContent = `${score2} points`;
            break;
        case 'Summer':
            score1 = calculateSleepyValleyScore();
            score2 = calculateWateringPotatoesScore();
            document.getElementById('score-Sleepy_valley').textContent = `${score1} points`;
            document.getElementById('score-Watering_potatoes').textContent = `${score2} points`;
            break;
        case 'Autumn':
            score1 = calculateWateringPotatoesScore();
            score2 = calculateBorderlandsScore();
            document.getElementById('score-Watering_potatoes').textContent = `${score1} points`;
            document.getElementById('score-Borderlands').textContent = `${score2} points`;
            break;
        case 'Winter':
            score1 = calculateBorderlandsScore();
            score2 = calculateEdgeOfTheForestScore();
            document.getElementById('score-Borderlands').textContent = `${score1} points`;
            document.getElementById('score-Edge_of_the_forest').textContent = `${score2} points`;
            break;
    }

    // Update the UI elements for mission scores
    // document.getElementById('score-mission-1').textContent = `Mission 1 Score: ${score1}`;
    // document.getElementById('score-mission-2').textContent = `Mission 2 Score: ${score2}`;
}

function displaySeasonScorebox(season) {
    const seasonScoreElement = document.getElementById(`${season.toLowerCase()}-score`);
    if (seasonScoreElement) {
        console.log(`Updating score display for ${season}:`, seasonScores[season]);
        seasonScoreElement.textContent = `${seasonScores[season]} points`;
    } else {
        console.log(`Score element for ${season} not found`);
    }
}

// Function to calculate the score for a season
function calculateSeasonScore(season) {
    let score = 0;
    // Calculate score based on missions for each season
    switch (season) {
        case 'Spring':
            score += calculateEdgeOfTheForestScore() + calculateSleepyValleyScore();
            break;
        case 'Summer':
            score += calculateSleepyValleyScore() + calculateWateringPotatoesScore();
            break;
        case 'Autumn':
            score += calculateWateringPotatoesScore() + calculateBorderlandsScore();
            break;
        case 'Winter':
            score += calculateBorderlandsScore() + calculateEdgeOfTheForestScore();
            break;
    }
    seasonScores[season] = score;

    console.log(`Calculated score for ${season}:`, seasonScores[season]);
}

// Function to display the score of a season in a popup
function displaySeasonScorePopup(season) {
    let mission1Score = 0, mission2Score = 0;
    let mission1Name = '', mission2Name = '';

    switch (season) {
        case 'Spring':
            mission1Score = calculateEdgeOfTheForestScore();
            mission2Score = calculateSleepyValleyScore();
            mission1Name = 'Edge of the Forest';
            mission2Name = 'Sleepy Valley';
            break;
        case 'Summer':
            mission1Score = calculateSleepyValleyScore();
            mission2Score = calculateWateringPotatoesScore();
            mission1Name = 'Sleepy Valley';
            mission2Name = 'Watering Potatoes';
            break;
        case 'Autumn':
            mission1Score = calculateWateringPotatoesScore();
            mission2Score = calculateBorderlandsScore();
            mission1Name = 'Watering Potatoes';
            mission2Name = 'Borderlands';
            break;
        case 'Winter':
            mission1Score = calculateBorderlandsScore();
            mission2Score = calculateEdgeOfTheForestScore();
            mission1Name = 'Borderlands';
            mission2Name = 'Edge of the Forest';
            break;
    }

    // // Update the score display elements
    // document.getElementById('score-Edge_of_the_forest').textContent = calculateEdgeOfTheForestScore();
    // document.getElementById('score-Sleepy_valley').textContent = calculateSleepyValleyScore();
    // document.getElementById('score-Watering_potatoes').textContent = calculateWateringPotatoesScore();
    // document.getElementById('score-Borderlands').textContent = calculateBorderlandsScore();

    const seasonalScore = seasonScores[season];
    const totalScore = Object.values(seasonScores).reduce((acc, score) => acc + score, 0);

    alert(`Season: ${season}\nTotal Seasonal Points: ${seasonalScore}\n${mission1Name}: ${mission1Score}\n${mission2Name}: ${mission2Score}\nTotal Points: ${totalScore}`);
}


// Helper function to check if a cell contains a specific element
function containsElement(cell, element) {
    return cell.children.length > 0 && cell.children[0].classList.contains(element);
}

// Edge of the Forest
function calculateEdgeOfTheForestScore() {
    let score = 0;
    for (let i = 0; i < 11; i++) {
        // Check top and bottom rows
        if (containsElement(gameBoard.children[i], 'forest')) score++;
        if (containsElement(gameBoard.children[110 + i], 'forest')) score++;

        // Check left and right columns, skipping corners
        if (i > 0 && i < 10) {
            if (containsElement(gameBoard.children[i * 11], 'forest')) score++;
            if (containsElement(gameBoard.children[i * 11 + 10], 'forest')) score++;
        }
    }
    return score;
}

// Sleepy Valley
// Sleepy Valley (adjusted for current season)
function calculateSleepyValleyScore() {
    let score = 0;
    for (let i = 0; i < 11; i++) {
        let forestCount = 0;
        elementsPlaced[currentSeason].forEach(pos => {
            if (pos.element === 'forest' && pos.row === i) {
                forestCount++;
            }
        });
        if (forestCount >= 3) score += 4;
    }
    return score;
}


// Watering Potatoes
function calculateWateringPotatoesScore() {
    let score = 0;
    for (let i = 0; i < 11; i++) {
        for (let j = 0; j < 11; j++) {
            const cell = gameBoard.children[i * 11 + j];
            if (containsElement(cell, 'water')) {
                // Check adjacent cells
                if (i > 0 && containsElement(gameBoard.children[(i - 1) * 11 + j], 'plains')) score += 2;
                if (i < 10 && containsElement(gameBoard.children[(i + 1) * 11 + j], 'plains')) score += 2;
                if (j > 0 && containsElement(gameBoard.children[i * 11 + j - 1], 'plains')) score += 2;
                if (j < 10 && containsElement(gameBoard.children[i * 11 + j + 1], 'plains')) score += 2;
            }
        }
    }
    return score;
}

// Borderlands
function calculateBorderlandsScore() {
    let score = 0;
    for (let i = 0; i < 11; i++) {
        let rowFull = true, colFull = true;
        for (let j = 0; j < 11; j++) {
            if (gameBoard.children[i * 11 + j].children.length === 0) rowFull = false;
            if (gameBoard.children[j * 11 + i].children.length === 0) colFull = false;
        }
        if (rowFull) score += 6;
        if (colFull) score += 6;
    }
    return score;
}

// Function to display the score of a season
// function displaySeasonScore() {
//     // Update the UI to show the score for the current season
//     scoreDisplay.textContent = `Score for ${currentSeason}: ${seasonScores[currentSeason]}`;
// }

// Function to calculate and display the final score
function calculateFinalScore() {
    finalScore = Object.values(seasonScores).reduce((acc, score) => acc + score, 0);
}

function displayFinalScore() {
    finalScoreDisplay.textContent = `Final Score: ${finalScore}`;
}

let elementsPlaced = {
    'Spring': [],
    'Summer': [],
    'Autumn': [],
    'Winter': []
};

// Reset elementsPlaced for a new season
function resetElementsPlacedForSeason(season) {
    elementsPlaced[season] = [];
}

// Function to calculate the score for extra missions
function calculateExtraMissionsScore() {
    let extraScore = 0;
    extraScore += calculateTreeLineScore();
    extraScore += calculateWealthyTownScore();
    extraScore += calculateWateringCanalScore();
    extraScore += calculateMagiciansValleyScore();
    extraScore += calculateEmptySiteScore();
    extraScore += calculateRowOfHousesScore();
    extraScore += calculateOddNumberedSilosScore();
    extraScore += calculateRichCountrysideScore();
    return extraScore;
}


// Example implementation of "Tree Line" mission
function calculateTreeLineScore() {
    let maxLength = 0;
    for (let col = 0; col < 11; col++) {
        let currentLength = 0;
        for (let row = 0; row < 11; row++) {
            const cell = gameBoard.children[row * 11 + col];
            if (containsElement(cell, 'forest')) {
                currentLength++;
                maxLength = Math.max(maxLength, currentLength);
            } else {
                currentLength = 0;
            }
        }
    }
    return maxLength * 2;
}

// Implementations for each extra mission
function calculateTreeLineScore() {
    let maxLineLength = 0;
    for (let col = 0; col < 11; col++) {
        let currentLength = 0;
        for (let row = 0; row < 11; row++) {
            const cell = gameBoard.children[row * 11 + col];
            if (containsElement(cell, 'forest')) {
                currentLength++;
                maxLineLength = Math.max(maxLineLength, currentLength);
            } else {
                currentLength = 0;
            }
        }
    }
    return maxLineLength * 2;
}

function calculateWealthyTownScore() {
    let score = 0;
    for (let row = 0; row < 11; row++) {
        for (let col = 0; col < 11; col++) {
            const cell = gameBoard.children[row * 11 + col];
            if (containsElement(cell, 'village')) {
                let adjacentTypes = new Set();
                [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => {
                    let adjRow = row + dx, adjCol = col + dy;
                    if (adjRow >= 0 && adjRow < 11 && adjCol >= 0 && adjCol < 11) {
                        const adjacentCell = gameBoard.children[adjRow * 11 + adjCol];
                        if (adjacentCell.children.length > 0) {
                            adjacentTypes.add(adjacentCell.children[0].classList[0]);
                        }
                    }
                });
                if (adjacentTypes.size >= 3) score += 3;
            }
        }
    }
    return score;
}

function calculateWateringCanalScore() {
    let score = 0;
    for (let col = 0; col < 11; col++) {
        let farmCount = 0, waterCount = 0;
        for (let row = 0; row < 11; row++) {
            const cell = gameBoard.children[row * 11 + col];
            if (containsElement(cell, 'plains')) farmCount++;
            if (containsElement(cell, 'water')) waterCount++;
        }
        if (farmCount === waterCount && farmCount > 0) score += 4;
    }
    return score;
}

function calculateMagiciansValleyScore() {
    let score = 0;
    for (let row = 0; row < 11; row++) {
        for (let col = 0; col < 11; col++) {
            const cell = gameBoard.children[row * 11 + col];
            if (containsElement(cell, 'water')) {
                [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => {
                    let adjRow = row + dx, adjCol = col + dy;
                    if (adjRow >= 0 && adjRow < 11 && adjCol >= 0 && adjCol < 11) {
                        const adjacentCell = gameBoard.children[adjRow * 11 + adjCol];
                        if (containsElement(adjacentCell, 'mountain')) {
                            score += 3;
                        }
                    }
                });
            }
        }
    }
    return score;
}

function calculateEmptySiteScore() {
    let score = 0;
    for (let row = 0; row < 11; row++) {
        for (let col = 0; col < 11; col++) {
            const cell = gameBoard.children[row * 11 + col];
            if (cell.children.length === 0) {
                [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => {
                    let adjRow = row + dx, adjCol = col + dy;
                    if (adjRow >= 0 && adjRow < 11 && adjCol >= 0 && adjCol < 11) {
                        const adjacentCell = gameBoard.children[adjRow * 11 + adjCol];
                        if (containsElement(adjacentCell, 'village')) {
                            score += 2;
                        }
                    }
                });
            }
        }
    }
    return score;
}

function calculateRowOfHousesScore() {
    let maxLineLength = 0;
    for (let row = 0; row < 11; row++) {
        let currentLength = 0;
        for (let col = 0; col < 11; col++) {
            const cell = gameBoard.children[row * 11 + col];
            if (containsElement(cell, 'village')) {
                currentLength++;
                maxLineLength = Math.max(maxLineLength, currentLength);
            } else {
                currentLength = 0;
            }
        }
    }
    return maxLineLength * 2;
}

function calculateOddNumberedSilosScore() {
    let score = 0;
    for (let col = 0; col < 11; col++) {
        let fullColumn = true;
        for (let row = 0; row < 11; row++) {
            if (gameBoard.children[row * 11 + col].children.length === 0) {
                fullColumn = false;
                break;
            }
        }
        if (fullColumn && (col + 1) % 2 !== 0) score += 10;
    }
    return score;
}

function calculateRichCountrysideScore() {
    let score = 0;
    for (let row = 0; row < 11; row++) {
        let terrainTypes = new Set();
        for (let col = 0; col < 11; col++) {
            const cell = gameBoard.children[row * 11 + col];
            if (cell.children.length > 0) {
                terrainTypes.add(cell.children[0].classList[0]);
            }
        }
        if (terrainTypes.size >= 5) score += 4;
    }
    return score;
}

// Function to update the extra missions score display
function updateExtraMissionsScore() {
    let extraScore = calculateExtraMissionsScore();
    document.getElementById('extra-missions-score').textContent = `Extra Missions Score: ${extraScore}`;
}

// Modify the calculateFinalScore function to include extra mission points
function calculateFinalScore() {
    let extraMissionPoints = calculateExtraMissionsScore();
    finalScore = Object.values(seasonScores).reduce((acc, score) => acc + score, 0) + extraMissionPoints;
}

function updateActiveMissions(activeMissions) {
    // Remove 'active' class from all mission elements
    document.querySelectorAll('.mission').forEach(mission => {
        mission.classList.remove('active');
    });

    // Add 'active' class to active missions
    activeMissions.forEach(missionId => {
        const missionElement = document.getElementById(missionId);
        if (missionElement) {
            missionElement.classList.add('active');
        }
    });
}

// let gameState = {
//     totalTimeUnits: totalTimeUnits,
//     currentSeason: currentSeason,
//     seasonScores: seasonScores,
//     finalScore: finalScore,
//     selectedShape: selectedShape,
//     currentShapeInSupplyBox: currentShapeInSupplyBox,
//     elementsPlaced: elementsPlaced,
//     isGameOver: isGameOver
// };

// // Function to save the current game state to localStorage
// function saveGameState() {
//     gameState.totalTimeUnits = totalTimeUnits;
//     gameState.currentSeason = currentSeason;
//     gameState.seasonScores = seasonScores;
//     gameState.finalScore = finalScore;
//     gameState.selectedShape = selectedShape;
//     gameState.currentShapeInSupplyBox = currentShapeInSupplyBox;
//     gameState.elementsPlaced = elementsPlaced;
//     gameState.isGameOver = isGameOver;
//     localStorage.setItem('gameState', JSON.stringify(gameState));
// }

// // Function to load the game state from localStorage
// function loadGameState() {
//     let savedState = localStorage.getItem('gameState');
//     if (savedState) {
//         gameState = JSON.parse(savedState);
//         totalTimeUnits = gameState.totalTimeUnits;
//         currentSeason = gameState.currentSeason;
//         seasonScores = gameState.seasonScores;
//         finalScore = gameState.finalScore;
//         selectedShape = gameState.selectedShape;
//         currentShapeInSupplyBox = gameState.currentShapeInSupplyBox;
//         elementsPlaced = gameState.elementsPlaced;
//         isGameOver = gameState.isGameOver;
//         // Restore the UI and game state
//         restoreGameStateUI();
//     } else {
//         // Initialize a new game if no saved state is found
//         startNewGame(); // This function should set the initial state of the game
//     }
// }

// // // Add event listeners to save the game state at appropriate times
// // window.onunload = saveGameState;
// // window.onload = loadGameState;

// // Function to clear the saved game state from localStorage
// function clearGameState() {
//     localStorage.removeItem('gameState');
// }

// function startNewGame() {
//     // Initialize or reset game variables
//     totalTimeUnits = 0;
//     currentSeason = 'Spring';
//     seasonScores = { 'Spring': 0, 'Summer': 0, 'Autumn': 0, 'Winter': 0 };
//     finalScore = 0;
//     selectedShape = null;
//     currentShapeInSupplyBox = null;
//     elementsPlaced = { 'Spring': [], 'Summer': [], 'Autumn': [], 'Winter': [] };
//     isGameOver = false;

//     // Reset the UI for a new game
//     restoreGameStateUI(); // Resets UI elements based on the new game state
// }

// function restoreGameStateUI() {
//     // Update the display of time units
//     timeUnitDisplay.textContent = `Time Units: ${totalTimeUnits}`;

//     // Update the display of the current season
//     document.getElementById('current-season').textContent = `(${currentSeason})`;

//     // Update the season scores
//     for (let season in seasonScores) {
//         displaySeasonScorebox(season);
//     }

//     // Update the final score display
//     finalScoreDisplay.textContent = `Final Score: ${finalScore}`;

//     // Update the game board based on elementsPlaced
//     updateGameBoard();

//     // Check if a shape was selected before the game was saved
//     if (selectedShape) {
//         // Display the shape in the supply box
//         displayShapeInSupplyBox(selectedShape);
//     }

//     // Update mission scores and extra missions score
//     updateMissionScores();
//     updateExtraMissionsScore();

//     // Set game over state if applicable
//     if (isGameOver) {
//         alert("Game Over! Final Score: " + finalScore);
//     }
// }

// function updateGameBoard() {
//     // Clear the game board first
//     Array.from(gameBoard.children).forEach(cell => {
//         while (cell.firstChild) {
//             cell.removeChild(cell.firstChild);
//         }
//     });

//     // Place elements based on the saved state
//     Object.values(elementsPlaced).forEach(seasonElements => {
//         seasonElements.forEach(({ row, col, element }) => {
//             const cellIndex = row * 11 + col;
//             const img = createImageElement(element);
//             gameBoard.children[cellIndex].appendChild(img);
//         });
//     });
// }

// function displayShapeInSupplyBox(shape) {
//     // Clear the supply box
//     while (supplyBox.firstChild) {
//         supplyBox.removeChild(supplyBox.firstChild);
//     }

//     // Display the shape in the supply box
//     shape.layout.forEach(([dx, dy]) => {
//         const cellIndex = dx * 4 + dy;
//         const img = createImageElement(shape.element, shape.type);
//         supplyBox.children[cellIndex].appendChild(img);
//     });
// }



generateNewShapeInSupplyBox();
