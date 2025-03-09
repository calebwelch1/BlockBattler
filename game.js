const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const GRID_WIDTH = 6;
const GRID_HEIGHT = 12;
const BLOCK_SIZE = 40;
const COLORS = ['red', 'blue', 'green', 'yellow', 'purple'];

let grid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(null));
let cursor = { x: 2, y: 5}; // cursor starts near middle
let score = 0;
let lastRiseTime = Date.now();
const RISE_INTERVAL = 2000;
let riseOffset = 0;
const RISE_SPEED = 2;

// init grid with some blocks
function initGrid() {
    for (let y = GRID_HEIGHT -1; y >= GRID_HEIGHT - 3; y--){
        for (let x=0; x<GRID_WIDTH; x++){
        grid[y][x] = COLORS[Math.floor(Math.random() * COLORS.length)];// assign random color to each cell in bottom 3 rows
        }
    }
}

// draw grid and blocks
function draw() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    // draw grid
    for(let y=0; y<GRID_HEIGHT; y++) { //loop over each row in grid
        for (let x=0; x<GRID_WIDTH; x++){// loop over each column in current row
            if(grid[x][y]) { // check if current cell has a block (not null)
                ctx.fillStyle = grid[y][x]; // set the fill color to block color
                ctx.fillRect(x * BLOCK_SIZE, y * BLOCK_SIZE, BLOCK_SIZE -2, BLOCK_SIZE -2); // draws a filled rectangle for the block, slightly smaller than block size for spacing
            }
        }

    }

    //draw cursor
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 2;
    ctx.strokeRect(cursor.x * BLOCK_SIZE, cursor.y * BLOCK_SIZE, BLOCK_SIZE * 2, BLOCK_SIZE);
}

// input handling
document.addEventListener('keydown', (e) => {
    switch (e.key){
        case 'ArrowUp':
            if (cursor.y > 0) cursor.y--; // move cursor up onw row if not at top...
            break;
        case 'ArrowDown':
            if (cursor.y < GRID_HEIGHT -1) cursor.y++; // move cursor down one row if not at bottom...
            break;
        case 'ArrowLeft':
            if (cursor.x > 0) cursor.x--; 
        case 'ArrowRight':
            if (cursor.x < GRID_WIDTH -1) cursor.x++;
            break;
        case ' ':
            swapBlocks();
            break;
    }
    draw();
})

function swapBlocks() {
    const {x,y} = cursor; // destructure the cursor's x and y coordinates
    if (x + 1 < GRID_WIDTH) { // ensure swap won't go out of bounds
        [grid[y][x], grid[y][x+1]] = [grid[y][x+1],grid[y][x]]; // swaps the blocks at cursor.x with one to its right with array destructoring
        checkMatches();
    }
}

function checkMatches() {
    let matches = [];

    // horizontal matches
    for(let y=0; y<GRID_HEIGHT; y++) { //loop over each row in grid
        for (let x=0; x<GRID_WIDTH -2; x++) { // loop over row, stop 2 short to check 3 blocks;
            if(grid[y][x] && grid[y][x] === grid[y][x+1] && grid[y][x] === grid[y][x+2]) { // check 3 identical blocks in a row
                matches.push({x,y}, {x: x+1,y}, {x: x+2,y}); // add positions of matched blocks to array
            }

        }
    }
    // vertical matches
    for(let x=0; x<GRID_WIDTH; x++) { //loop over each column in grid
        for (let y=0; y<GRID_HEIGHT -2; y++) { // loop over row, stop 2 short to check 3 blocks;
            if(grid[y][x] && grid[y][x] === grid[y+1][x] && grid[y][x] === grid[y+2][x]) { // check 3 identical blocks in a column
                matches.push({x,y}, {x,y:y+1}, {x,y:y+2}); // add positions of matched blocks to array
            }

        }
    }
    // clear matches

    matches.forEach(({x,y}) => {
        grid[y][x] = null;
        score+=10;

    });

    applyGravity(); // apply gravity to drop blocks after each clear
}

function applyGravity() {
    for (let x=0; x<GRID_WIDTH; x++){ //loop over each column
        for (let y =GRID_HEIGHT-1;y>0;y--) { //loop ofrom bottom to top, excluding top row
            if (!grid[y][x] && grid[y-1][x]) { // if current cell is empty and one above it has a block
                grid[y][x] = grid[y-1][x]; // moves block down one row
                grid[y-1][x]=null; //clears cell it came from
            }
        }
    }
}

//game loop and rising blocks

function gameLoop() {
    // rise blocks every few frames
    const now = Date.now();
    if (now - lastRiseTime >= RISE_INTERVAL)  { // check if 2 seconds have passed since last rise
        if (riseOffset >= BLOCK_SIZE){
            for (let y=0; y<GRID_HEIGHT -1; y++) { // loop over all rows except bottom
                for (let x=0; x<GRID_WIDTH; x++) { // loop over each column
                    grid[y][x] = grid[y+1][x];      // shift each block up one row
                }
            }
        }
        for ( let x=0; x<GRID_WIDTH; x++){ // loop over bottom row
            grid[GRID_HEIGHT-1][x] = COLORS[Math.floor(Math.random() * COLORS.length)]; // add new random blocks to bottom
        }
        riseOffset = 0;
        lastRiseTime = now;
    }

    riseOffset += RISE_SPEED;
    checkMatches();
    draw();
    requestAnimationFrame(gameLoop); // schedule next frame of gameloop
}

initGrid();
draw();
gameLoop();