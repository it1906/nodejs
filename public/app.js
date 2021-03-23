document.addEventListener('DOMContentLoaded', () => {
    const userGrid = document.querySelector('.grid-user');
    const computerGrid = document.querySelector('.grid-computer');
    const displayGrid = document.querySelector('.grid-display');
    const ships = document.querySelectorAll('.ship');
    const destroyer = document.querySelector('.destroyer-container');
    const submarine = document.querySelector('.submarine-container');
    const cruiser = document.querySelector('.cruiser-container');
    const battleship = document.querySelector('.battleship-container');
    const carrier = document.querySelector('.carrier-container');
    const startButton = document.querySelector('#start');
    const rotateButton = document.querySelector('#rotate');
    const turnDisplay = document.querySelector('#whose-go');
    const infoDisplay = document.querySelector('#info');
    const singlePlayerButton = document.querySelector('#singlePlayerButton')
    const multiPlayerButton = document.querySelector('#multiPlayerButton')
    const userSquares = [];
    const computerSquares = [];
    let isHorizontal = true;
    let isGameOver = false;
    let currentPlayer = 'user';
    const width = 10;
    let gameMode = "";
    let playerNum = 0;
    let ready = "false";
    let enemyReady = "false";
    let allShipsPlaced = "false";
    let shitFired = -1;

    //vyber modu
    singlePlayerButton.addEventListener('click', startSinglePlayer)
    multiPlayerButton.addEventListener('click', startMultiPlayer)

    //multiplayer
    function startMultiPlayer() {
        gameMode = "multiPlayer"

        const socket = io();

        //cislo hrace
        socket.on('player-number', num => {
            if (num === -1) {
                infoDisplay.innerHTML = "sorry, the server is full"
            } else {
                playerNum = parseInt(num)
                if (playerNum === 1) currentPlayer = "enemy"
                console.log(playerNum)

                //status ostatnich hracu
                socket.emit('check-players')
            }
        })
        socket.on('player-connection', num => {
            console.log(`player number ${num} has connected/disconnected`)
            playerConnectedOrDisconnected(num)
        })

        //nepritel ready
        socket.on('enemy-ready', num => {
            enemyReady = true
            playerReady(num)
            if (ready) playGameMulti(socket)
        })

        //kontrola statusu
        socket.on('check-players', players => {
            players.forEach((p, i) => {
                if (p.connected) playerConnectedOrDisconnected(i)
                if (p.ready) {
                    playerReady(i)
                    if (i !== playerReady) enemyReady = true
                }
            })
        })

        //ready tlacitko
        startButton.addEventListener('click', () => {
            if (allShipsPlaced) playGameMulti(socket)
            else infoDisplay.innerHTML = "Please place all ships"
        })

        function playerConnectedOrDisconnected(num) {
            let player = `.p${parseInt(num) + 1}`
            document.querySelector(`${player} .connected span`).classList.toggle('green')
            if (parseInt(num) === playerNum) document.querySelector(player).style.fontWeight = 'bold'
        }
    }

    //singleplayer
    function startSinglePlayer() {
        gameMode = "singlePlayer"
        generate(shipArray[0])
        generate(shipArray[1])
        generate(shipArray[2])
        generate(shipArray[3])
        generate(shipArray[4])

        startButton.addEventListener('click', playGameSingle)
    }

    //Tvorba desky
    function createBoard(grid, squares, width = 10) {
        for (let i = 0; i < width * width; i++) {
            const square = document.createElement('div')
            square.dataset.id = i
            grid.appendChild(square)
            squares.push(square)
        }
    }
    createBoard(userGrid, userSquares)
    createBoard(computerGrid, computerSquares)

    //Lodicky
    const shipArray = [
        {
            name: 'destroyer',
            directions: [
                [0, 1],
                [0, width]
            ]
        },
        {
            name: 'submarine',
            directions: [
                [0, 1, 2],
                [0, width, width * 2]
            ]
        },
        {
            name: 'cruiser',
            directions: [
                [0, 1, 2],
                [0, width, width * 2]
            ]
        },
        {
            name: 'battleship',
            directions: [
                [0, 1, 2, 3],
                [0, width, width * 2, width * 3]
            ]
        },
        {
            name: 'carrier',
            directions: [
                [0, 1, 2, 3, 4],
                [0, width, width * 2, width * 3, width * 4]
            ]
        },
    ]

    //random kreslime lodicky
    function generate(ship) {
        let randomDirection = Math.floor(Math.random() * ship.directions.length)
        let current = ship.directions[randomDirection]
        if (randomDirection === 0) direction = 1
        if (randomDirection === 1) direction = 10
        let randomStart = Math.abs(Math.floor(Math.random() * computerSquares.length - (ship.directions[0].length * direction)))

        const isTaken = current.some(index => computerSquares[randomStart + index].classList.contains('taken'))
        const isAtRightEdge = current.some(index => (randomStart + index) % width === width - 1)
        const isAtLeftEdge = current.some(index => (randomStart + index) % width === 0)

        if (!isTaken && !isAtRightEdge && !isAtLeftEdge) current.forEach(index => computerSquares[randomStart + index].classList.add('taken', ship.name))

        else generate(ship)
    }

    //rotace lodicek
    function rotate() {
        if (isHorizontal) {
            destroyer.classList.toggle('destroyer-container-vertical')
            submarine.classList.toggle('submarine-container-vertical')
            cruiser.classList.toggle('cruiser-container-vertical')
            battleship.classList.toggle('battleship-container-vertical')
            carrier.classList.toggle('carrier-container-vertical')
            isHorizontal = false
            return
        }
        if (!isHorizontal) {
            destroyer.classList.toggle('destroyer-container-vertical')
            submarine.classList.toggle('submarine-container-vertical')
            cruiser.classList.toggle('cruiser-container-vertical')
            battleship.classList.toggle('battleship-container-vertical')
            carrier.classList.toggle('carrier-container-vertical')
            isHorizontal = true
            return
        }
    } rotateButton.addEventListener('click', rotate)

    //pohyb lodicek na pole
    ships.forEach(ship => ship.addEventListener('dragstart', dragStart))
    userSquares.forEach(square => square.addEventListener('dragstart', dragStart))
    userSquares.forEach(square => square.addEventListener('dragover', dragOver))
    userSquares.forEach(square => square.addEventListener('dragenter', dragEnter))
    userSquares.forEach(square => square.addEventListener('dragleave', dragLeave))
    userSquares.forEach(square => square.addEventListener('drop', dragDrop))
    userSquares.forEach(square => square.addEventListener('dragend', dragEnd))

    let selectedShipNameWithIndex
    let draggedShip
    let draggedShipLength

    ships.forEach(ship => ship.addEventListener('mousedown', (e) => {
        selectedShipNameWithIndex = e.target.id
    }))

    function dragStart() {
        draggedShip = this;
        draggedShipLength = this.childNodes.length;

    }
    function dragOver(e) {
        e.preventDefault()
    }
    function dragEnter(e) {
        e.preventDefault()
    }
    function dragLeave() {

    }
    function dragDrop() {
        let shipNameWithLastId = draggedShip.lastChild.id
        let shipClass = shipNameWithLastId.slice(0, -2)
        let lastShipIndex = parseInt(shipNameWithLastId.substr(-1))
        let shipLastId = lastShipIndex + parseInt(this.dataset.id)

        const notAllowedHorizontal = [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 1, 11, 21, 31, 41, 51, 61, 71, 81, 91, 2, 22, 32, 42, 52, 62, 72, 82, 92, 3, 13, 23, 33, 43, 53, 63, 73, 83, 93]
        const notAllowedVertical = [99, 98, 97, 96, 95, 94, 93, 92, 91, 90, 89, 88, 87, 86, 85, 84, 83, 82, 81, 80, 79, 78, 77, 76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 63, 62, 61, 60]

        let newNotAllowedHorizontal = notAllowedHorizontal.splice(0, 10 * lastShipIndex)
        let newNotAllowedVertical = notAllowedVertical.splice(0, 10 * lastShipIndex)


        selectedShipIndex = parseInt(selectedShipNameWithIndex.substr(-1))

        shipLastId = shipLastId - selectedShipIndex;

        if (isHorizontal && !newNotAllowedHorizontal.includes(shipLastId)) {
            for (let i = 0; i < draggedShipLength; i++) {
                userSquares[parseInt(this.dataset.id) - selectedShipIndex + i].classList.add('taken', shipClass)
            }
        } else if (!isHorizontal && !newNotAllowedVertical.includes(shipLastId)) {
            for (let i = 0; i < draggedShipLength; i++) {
                userSquares[parseInt(this.dataset.id) - selectedShipIndex + width * i].classList.add('taken', shipClass)
            }
        } else return


        displayGrid.removeChild(draggedShip)
        if (!displayGrid.querySelector('.ship')) allShipsPlaced = true
    }
    function dragEnd() {
    }

    //multi logic
    function playGameMulti(socket) {
        if (isGameOver) return
        if (!ready) {
            socket.emit('player-ready')
            ready = true
            playerReady(playerNum)
        }

        if (enemyReady) {
            if (currentPlayer === 'user') {
                turnDisplay.innerHTML = 'Your Go'
            }
            if (currentPlayer === 'enemy') {
                turnDisplay.innerHTML = "Enemy's Go"
            }
        }
    }

    function playerReady(num) {
        let player = `.p${parseInt(num) + 1}`
        document.querySelector(`${player} .ready span`).classList.toggle('green')
    }
    //single logic
    function playGameSingle() {
        if (isGameOver) return
        if (currentPlayer === 'user') {
            turnDisplay.innerHTML = 'Your Go'
            computerSquares.forEach(square => square.addEventListener('click', function (e) {
                revealSquare(square)
            }))
        }
        if (currentPlayer === 'computer') {
            turnDisplay.innerHTML = 'Computers Go'
            setTimeout(computerGo, 1000)
        }
    }

    let destroyerCount = 0;
    let submarineCount = 0;
    let cruiserCount = 0;
    let battleshipCount = 0;
    let carrierCount = 0;

    function revealSquare(square) {
        if (!square.classList.contains('boom')) {
            if (square.classList.contains('destroyer')) destroyerCount++
            if (square.classList.contains('submarine')) submarineCount++
            if (square.classList.contains('cruiser')) cruiserCount++
            if (square.classList.contains('battleship')) battleshipCount++
            if (square.classList.contains('carrier')) carrierCount++
        }
        if (square.classList.contains('taken')) {
            square.classList.add('boom')
        } else {
            square.classList.add('miss')
        }
        checkForWins()
        currentPlayer = 'computer'
        playGameSingle()
    }
    let cpuDestroyerCount = 0;
    let cpuSubmarineCount = 0;
    let cpuCruiserCount = 0;
    let cpuBattleshipCount = 0;
    let cpuCarrierCount = 0;

    function computerGo() {
        let random = Math.floor(Math.random() * userSquares.length)
        if (!userSquares[random].classList.contains('boom')) {
            userSquares[random].classList.add('boom')
            if (userSquares[random].classList.contains('destroyer')) cpuDestroyerCount++
            if (userSquares[random].classList.contains('submarine')) cpuSubmarineCount++
            if (userSquares[random].classList.contains('cruiser')) cpuCruiserCount++
            if (userSquares[random].classList.contains('battleship')) cpuBattleshipCount++
            if (userSquares[random].classList.contains('carrier')) cpuCarrierCount++
            checkForWins()
        } else computerGo()
        currentPlayer = 'user'
        turnDisplay.innerHTML = 'Your Go'
    }

    function checkForWins() {
        if (destroyerCount === 2) {
            infoDisplay.innerHTML = 'You sunk the enemy destroyer'
            destroyerCount = 10
        }
        if (submarineCount === 3) {
            infoDisplay.innerHTML = 'You sunk the enemy submarine'
            submarineCount = 10
        }
        if (cruiserCount === 3) {
            infoDisplay.innerHTML = 'You sunk the enemy cruiser'
            cruiserCount = 10
        }
        if (battleshipCount === 4) {
            infoDisplay.innerHTML = 'You sunk the enemy battleship'
            battleshipCount = 10
        }
        if (carrierCount === 5) {
            infoDisplay.innerHTML = 'You sunk the enemy carrier'
            carrierCount = 10
        }
        if (cpuDestroyerCount === 2) {
            infoDisplay.innerHTML = 'Destroyer lost'
            cpuDestroyerCount = 10
        }
        if (cpuSubmarineCount === 3) {
            infoDisplay.innerHTML = 'Submarine lost'
            cpuSubmarineCount = 10
        }
        if (cpuCruiserCount === 3) {
            infoDisplay.innerHTML = 'Cruiser lost'
            cpuCruiserCount = 10
        }
        if (cpuBattleshipCount === 4) {
            infoDisplay.innerHTML = 'Battleship lost'
            cpuBattleshipCount = 10
        }
        if (cpuCarrierCount === 5) {
            infoDisplay.innerHTML = 'Carrier lost'
            cpuCarrierCount = 10
        }
        if ((destroyerCount + submarineCount + cruiserCount + battleshipCount + carrierCount) === 50) {
            infoDisplay.innerHTML = "YOU WON"
            gameOver()
        }
        if ((cpuDestroyerCount + cpuSubmarineCount + cpuCruiserCount + cpuBattleshipCount + cpuCarrierCount) === 50) {
            infoDisplay.innerHTML = "YOU LOST"
            gameOver()
        }
    }

    function gameOver() {
        isGameOver = true
        startButton.removeEventListener('click', playGameSingle)
    }

})