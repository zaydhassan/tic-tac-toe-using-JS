<template>
    <div id="app">
        <el-row>
            <el-col :lg="8" :md="8" :sm="24" style="background-color: rgb(238, 241, 246);">
                <h4 class="controller-head">Controllers:</h4>
                <br />
                <div class="container-header" style="margin:0px 32px;">
                    <i class="el-icon-info" style="margin-right: 15px"></i>
                    <span v-if="winState == ''">Click the play button</span>
                    <span
                        v-else
                        :class="winState+'color'"
                    >You {{winState == 'playing' ? "are playing" : winState}} this game</span>
                </div>
                <div style="margin:32px;">
                    <el-button @click="startGame" type="primary" plain>
                        <span v-if="winState==''">
                            <i class="el-icon-video-play"></i> Play
                        </span>
                        <span v-else-if="winState=='playing'">
                            <i class="el-icon-video-pause"></i> Playing...
                        </span>
                        <span v-else>
                            <i class="el-icon-refresh-right"></i> Play again
                        </span>
                    </el-button>

                    <el-divider></el-divider>
                    <div>
                        <p>Your symbol:</p>
                        <div class="choose-sign">{{huPlayer}}</div>
                    </div>
                </div>
            </el-col>
            <el-col :lg="16" :md="16" :sm="24" style="padding: 32px;">
                <table>
                    <tr>
                        <td
                            @click="turnClick"
                            v-for="i in 3"
                            :key="i-1"
                            class="cell"
                            :class="winState"
                            :id="i-1"
                        ></td>
                    </tr>
                    <tr>
                        <td
                            @click="turnClick"
                            v-for="i in 3"
                            :key="i+2"
                            class="cell"
                            :class="winState"
                            :id="i+2"
                        ></td>
                    </tr>
                    <tr>
                        <td
                            @click="turnClick"
                            v-for="i in 3"
                            :key="i+5"
                            class="cell"
                            :class="winState"
                            :id="i+5"
                        ></td>
                    </tr>
                </table>
                <el-dialog
                    title="Tips: Please choose a symbol, except you get random by default. "
                    :visible.sync="selectTag"
                    width="250px"
                >
                    <div class="selectSym">
                        <p>Select symbol:</p>
                        <el-button @click="selectSym('X')">X</el-button>
                        <el-button @click="selectSym('O')">O</el-button>
                    </div>
                </el-dialog>
                <el-dialog title="Game Over" :visible.sync="gameover" width="250px" center>
                    <img
                        width="200"
                        v-if="winState=='lose'"
                        src="./assets/lose.png"
                        alt="Lose"
                    />
                    <img
                        width="200"
                        v-if="winState=='win'"
                        src="./assets/win.gif"
                        alt="Win"
                    />
                    <div v-if="winState=='tie'">
                        <h3 style="text-align:center;">Tie game</h3>
                        <img width="200" src="./assets/tie.png" alt="Tie" />
                    </div>

                    <span slot="footer" class="dialog-footer">
                        <el-button type="success" @click="startGame">Play Again</el-button>
                    </span>
                </el-dialog>
            </el-col>
        </el-row>
    </div>
</template>

<script>
export default {
    name: "App",
    data() {
        return {
            gameover: false,
            disabled: false,
            winner: false,
            winState: "",
            cells: null,
            selectTag: false,
            playingBoard: [],
            huPlayer: "O",
            aiPlayer: "X",
            winCases: [
                [0, 1, 2],
                [3, 4, 5],
                [6, 7, 8],
                [0, 4, 8],
                [6, 4, 2],
                [2, 5, 8],
                [1, 4, 7],
                [0, 3, 6]
            ],
            cornerSquares: [0,2,6,8],
            middileSquares: [1,3,5,7]
        };
    },
    methods: {
        startGame() {
            this.playingBoard = Array.from(Array(9).keys());
            this.disabled = false;
            this.selectTag = true;
            this.gameover = false;
            this.cells.forEach(element => {
                element.innerText = "";
                element.style.removeProperty("background-color");
            });
            this.winState = "playing";
        },
        selectSym(sym) {
            this.selectTag = false;
            this.huPlayer = sym;
            this.aiPlayer = sym === "O" ? "X" : "O";
            this.playingBoard = Array.from(Array(9).keys());
            if (this.aiPlayer === "X") {
                this.turn(this.bestSpot(), this.aiPlayer);
            }
        },
        turnClick(square) {
            if (
                typeof this.playingBoard[square.target.id] == "number" &&
                !this.disabled
            ) {
                this.turn(square.target.id, this.huPlayer);
                if (!this.checkTie() && !this.winner)
                    this.turn(this.bestSpot(), this.aiPlayer);
            }
        },
        turn(squareId, player) {
            this.playingBoard[squareId] = player;
            document.getElementById(squareId).innerText = player;
            let gameWon = this.checkWin(player);
            this.checkTie();
            if (gameWon) this.gameOver(gameWon);
        },
        emptySquares() {
            let pos = this.playingBoard.filter(s => typeof s == "number");
            if ((Math.ceil(Math.random() * 2)) == 1) {
                return pos;
            } else {
                return pos.sort(() => Math.random() - 0.5);
            }
        },
        bestSpot() {
            let emptyCells = this.emptySquares();
            let wp = this.winingPosition();

            if(wp != 9)
                return wp;

            let bestPosition = this.prirorityBasedBestPosition();
            if(bestPosition != 9)
            {
                return bestPosition;
            }

            return emptyCells[0];
        },

        winingPosition()
        {
            let aiCount = 0;
            this.playingBoard.forEach(cell => {
                if(cell === this.aiPlayer)
                    aiCount++;
            })

            if(aiCount >= 2)
             {
                for(let [index] of this.winCases.entries())
                {
                    let aiInWinCaseCount = 0,  huInWinCaseCount = 0, winpos0 = 0, winpos1 = 0, winpos2 = 0;

                    //aiInWinningCassesCount
                    if(this.playingBoard[this.winCases[index][0]] === this.aiPlayer)
                    {
                        aiInWinCaseCount++;
                        winpos0 = 1;
                    }
                    if(this.playingBoard[this.winCases[index][1]] === this.aiPlayer)
                    {
                        aiInWinCaseCount++;
                        winpos1 = 1;
                    }
                    if(this.playingBoard[this.winCases[index][2]] === this.aiPlayer)
                    {
                        aiInWinCaseCount++;
                        winpos2 = 1;
                    }

                    ////humanInWinningCassesCount
                    if(this.playingBoard[this.winCases[index][0]] === this.huPlayer)
                    {
                        huInWinCaseCount++;

                    }
                    if(this.playingBoard[this.winCases[index][1]] === this.huPlayer)
                    {
                        huInWinCaseCount++;

                    }
                    if(this.playingBoard[this.winCases[index][2]] === this.huPlayer)
                    {
                        huInWinCaseCount++;

                    }

                    if(aiInWinCaseCount == 2 && huInWinCaseCount == 0)
                    {
                        if(winpos0 == 0 )
                            return this.winCases[index][0];
                        if(winpos1 == 0 )
                            return this.winCases[index][1];
                        if(winpos2 == 0 )
                            return this.winCases[index][2];
                    }

                }
             }

            return 9;
        },
        prirorityBasedBestPosition(){

            let prioritymap = new Array(9);

            this.playingBoard.forEach(e => {
                prioritymap[e] = 1;
                if(typeof e != 'number')
                    prioritymap[e] = 0;

                if(prioritymap[e] == 1)
                {
                    let pr = 1;

                    for(let [index] of this.winCases.entries())
                    {
                        if(this.winCases[index].includes(e))
                        {
                            if(
                                this.playingBoard[this.winCases[index][0]] != this.aiPlayer
                                 && this.playingBoard[this.winCases[index][1]] != this.aiPlayer
                                  && this.playingBoard[this.winCases[index][2]] != this.aiPlayer
                                )
                            {
                                pr++;
                                let times = 0;
                                //check how many times huPlayer exists on this winCase
                                if(this.playingBoard[this.winCases[index][0]] == this.huPlayer)
                                    times++;
                                if(this.playingBoard[this.winCases[index][1]] == this.huPlayer)
                                    times++;
                                if(this.playingBoard[this.winCases[index][2]] == this.huPlayer)
                                    times++;
                                // increase priority if there is huPlayer exists;
                                if(
                                    this.playingBoard[this.winCases[index][0]] == this.huPlayer
                                     || this.playingBoard[this.winCases[index][1]] == this.huPlayer
                                     || this.playingBoard[this.winCases[index][2]] == this.huPlayer
                                     )
                                {

                                    pr++;
                                }
                                /* if huPlayer exist more than one than increase priority by 4,
                                 4 is just a huge number in this context. this position should have the highest priority */
                                if(times == 2)
                                    pr+=4;
                            }


                        }
                    }

                    prioritymap[e] = pr;

                }
            })

            let bestPosition = 9, mx = 1;

            prioritymap.forEach((el, index) => {
                if(typeof el == "number" && el > mx){
                    mx = el;
                    bestPosition = index;
                }
            })

            //check for same priority cases
            let howManyCornerHasMax = 0;
            let howManyCornerHasHu = 0;

            prioritymap.forEach((el,index) => {
                if(el == mx && this.cornerSquares.includes(index))
                {
                    howManyCornerHasMax++;
                }
            })

            this.playingBoard.forEach((el, index) => {

                if(this.cornerSquares.includes(index) && el === this.huPlayer)
                {
                    howManyCornerHasHu++;
                }
            })

            console.log('index ', howManyCornerHasHu);
            mx = 1;

            if(howManyCornerHasMax >= 2 && howManyCornerHasHu >= 2){
                prioritymap.forEach((el, index) => {
                    if(typeof el == "number" &&  this.middileSquares.includes(index) && el > mx){
                        console.log("mx index: ", el);
                        mx = el;
                        bestPosition = index;
                    }
                })
            }

            return bestPosition;
        },
        checkTie() {
            if (this.emptySquares().length === 0 && !this.winner) {
                this.declareWinner("tie");
                return true;
            }
            return false;
        },
        declareWinner(who) {
            this.gameover = true;
            this.winState = who;
            setTimeout(() => {
                this.gameover = false;
            }, 2000);
        },
        checkWin(player) {
            let plays = this.playingBoard.reduce(
                (a, e, i) => (e === player ? a.concat(i) : a),
                []
            );
            this.winner = null;
            for (let [index, win] of this.winCases.entries()) {
                if (win.every(elem => plays.indexOf(elem) > -1)) {
                    this.winner = { index: index, player: player };
                    break;
                }
            }
            return this.winner;
        },
        gameOver(gameWon) {
            for (let index of this.winCases[gameWon.index]) {
                document.getElementById(index).style.backgroundColor =
                    gameWon.player == this.huPlayer ? "#409eff" : "red";
            }
            this.disabled = true;
            this.declareWinner(
                (this.winState =
                    gameWon.player === this.huPlayer ? "win" : "lose")
            );
        }
    },
    mounted() {
        this.cells = document.querySelectorAll(".cell");
    }
};
</script>
<style src="./styles/global-styles.css">
</style>