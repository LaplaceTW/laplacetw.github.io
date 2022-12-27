const { createApp, computed } = Vue;
createApp({
	data() {
    return {
      ctx: "",
      x: 0,
      y: 0,
      dx: 2,
      dy: -2,
      ballRadius: 15,
      rightPressed: false,
      leftPressed: false,
      bricks: [],
      brickRowCount: 5,
      brickColumnCount: 3,
      brickWidth: 40,
      brickHeight: 15,
      brickPadding: 10,
      brickOffsetTop: 30,
      brickOffsetLeft: 30,
      paddleHeight: 10,
      paddleWidth: 108,
      paddleX: 0,
      score: 0,
      lives: 3
    }
  },
  mounted() {
    document.addEventListener("keydown", this.keyDownHandler, false);
    document.addEventListener("keyup", this.keyUpHandler, false);
		document.addEventListener("mousemove", this.mouseMoveHandler, false);
    this.ctx = this.$refs.canvas.getContext("2d");
    this.x = this.$refs.canvas.width / 2;
    this.y = this.$refs.canvas.height - 40;
    this.paddleX = (this.$refs.canvas.width - this.paddleWidth) / 2;
    for(let c = 0; c < this.brickColumnCount; c++) {
      this.bricks[c] = [];
      for(let r = 0; r < this.brickRowCount; r++) {
        this.bricks[c][r] = { x: 0, y: 0, status: 1 };
      }
    }
    this.draw();
  },
  methods: {
    keyDownHandler(e) {
        if(e.key == "Right" || e.key == "ArrowRight") {
					this.rightPressed = true;
        }
        else if(e.key == "Left" || e.key == "ArrowLeft") {
					this.leftPressed = true;
        }
    },
    keyUpHandler(e) {
        if(e.key == "Right" || e.key == "ArrowRight") {
					this.rightPressed = false;
        }
        else if(e.key == "Left" || e.key == "ArrowLeft") {
					this.leftPressed = false;
        }
    },
		mouseMoveHandler(e) {
			let canvas = this.$refs.canvas;
			let relativeX = e.clientX - canvas.offsetLeft;
			if(relativeX > 0 && relativeX < canvas.width) {
				let x = relativeX - this.paddleWidth / 2;
				let max = canvas.width - this.paddleWidth - 20;
				if (x < 20){
					this.paddleX = 20;
				}
				if (x >= 20 && x <= max){
					this.paddleX = x;
				}
			}
		},
    collisionDetection() {
      for(let c = 0; c < this.brickColumnCount; c++) {
        for(let r = 0; r < this.brickRowCount; r++) {
          let b = this.bricks[c][r];
          if(b.status == 1) {
            if(this.x > b.x && this.x < b.x + this.brickWidth && this.y > b.y && this.y < b.y + this.brickHeight) {
              this.dy = -this.dy;
              b.status = 0;
              this.score++;
              if(this.score == this.brickRowCount * this.brickColumnCount) {
                alert("YOU WIN, CONGRATS!");
                document.location.reload();
              }
            }
          }
        }
      }
    },
    drawBall() {
			this.$refs.ball.style.left = `${this.x}px`;
			this.$refs.ball.style.top = `${this.y}px`;
    },
    drawPaddle() {
			let canvas = this.$refs.canvas;
			let y = canvas.height - this.paddleHeight - 10;
			this.$refs.paddle.style.top = `${y}px`;
			this.$refs.paddle.style.left = `${this.paddleX}px`;
    },
    drawBricks() {
      for(let c = 0; c < this.brickColumnCount; c++) {
        for(let r = 0; r < this.brickRowCount; r++) {
          if(this.bricks[c][r].status == 1) {
            let brickX = (r * (this.brickWidth + this.brickPadding)) + this.brickOffsetLeft;
            let brickY = (c * (this.brickHeight + this.brickPadding)) + this.brickOffsetTop;
            this.bricks[c][r].x = brickX;
            this.bricks[c][r].y = brickY;
            this.ctx.beginPath();
            this.ctx.rect(brickX, brickY, this.brickWidth, this.brickHeight);
            this.ctx.fillStyle = "#0095DD";
            this.ctx.fill();
            this.ctx.closePath();
          }
        }
      }
    },
    drawScore() {
      this.ctx.font = "14px Arial";
      this.ctx.fillStyle = "#0095DD";
      this.ctx.fillText(`Score: ${this.score}`, 20, 27);
    },
    drawLives() {
      let canvas = this.$refs.canvas;
      this.ctx.font = "14px Arial";
      this.ctx.fillStyle = "#0095DD";
      this.ctx.fillText(`Lives: ${this.lives}`, canvas.width - 65, 27);
    },
    draw() {
      let canvas = this.$refs.canvas;
      this.ctx.clearRect(0, 0, canvas.width, canvas.height);
      this.drawBricks();
      this.drawBall();
      this.drawPaddle();
      this.drawScore();
      this.drawLives();
      this.collisionDetection();

      if(this.x + this.dx > canvas.width-this.ballRadius-20 || this.x + this.dx < this.ballRadius) {
        this.dx = -this.dx;
      }
      if(this.y + this.dy < this.ballRadius) {
        this.dy = -this.dy;
      }
      else if(this.y + this.dy > canvas.height-this.ballRadius-20) {
        if(this.x > this.paddleX && this.x < this.paddleX + this.paddleWidth) {
          this.dy = -this.dy;
        }
        else {
          this.lives--;
          if(!this.lives) {
            alert("GAME OVER");
            document.location.reload();
          }
          else {
            this.x = canvas.width/2;
            this.y = canvas.height-40;
            this.dx = 3;
            this.dy = -3;
            this.paddleX = (canvas.width-this.paddleWidth)/2;
          }
        }
      }

      if(this.rightPressed && this.paddleX < canvas.width-this.paddleWidth-20) {
        this.paddleX += 7;
      }
      else if(this.leftPressed && this.paddleX > 20) {
        this.paddleX -= 7;
      }

      this.x += this.dx;
      this.y += this.dy;
      requestAnimationFrame(this.draw);
    }
  }
}).mount("#app");