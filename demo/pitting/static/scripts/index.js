function zeroPad(num) {
    return (num < 10 ? "0" + num : num).toString();
}

function dateTimeNow() {
    let date = new Date();
    let yyyy = date.getFullYear();
    let mm = zeroPad(date.getMonth() + 1);
    let dd = zeroPad(date.getDate());
    let hours = zeroPad(date.getHours());
    let mins = zeroPad(date.getMinutes());
    let secs = zeroPad(date.getSeconds());

    return yyyy + mm + dd + "_" + hours + mins + secs;
}

const app = new Vue({
    el: "#app",
    data: {
        curView: "uploadVideo",
        camState: false,
        recState: false,
        videoLength: 40,
        videoStream: null,
        videoTimeCountdown: ""
    },
    methods: {
        changeView(component) {
            if(this.camState) { this.closeCamera(); }
            this.curView = component;
        },

        openNav(event) {
            event.preventDefault();
            this.$refs.sideNav.style.width = "250px";
        },
        
        closeNav(event) {
            event.preventDefault();
            this.$refs.sideNav.style.width = "0px";
        },
        
        openCamera() {
            this.videoTimeCountdown = "00:" + zeroPad(this.videoLength);

            const constraints = (window.constraints = {
                audio: false,
                video: {
                    facingMode: "environment",
                    frameRate: { max: 30 }
                }
            });

            // getUserMedia
            navigator.mediaDevices.getUserMedia(constraints)
            .then((stream) => {
                this.camState = true;
                this.videoStream = stream;

                const camera = this.$refs.camera;
                const canvas = this.$refs.screenshot;
                
                camera.srcObject = stream;
                camera.captureStream = camera.captureStream || camera.mozCaptureStream;
                
                // important for canvas.context.drawImage()
                canvas.setAttribute('width', camera.clientWidth);
                canvas.setAttribute('height', camera.clientHeight);
            })
            .catch((error) => alert("Starting camera error."));
        },

        closeCamera() {
            let tracks = this.$refs.camera.srcObject.getTracks();
            tracks.forEach((track) => { track.stop(); })

            this.camState = false;
            this.videoStream = null;
            this.$refs.camera.srcObject = null;
        },

        recVideo() {
            this.recState = true;

            const chunks = [];
            const images = [];
            const isSafari = window.navigator.userAgent.indexOf("Safari") > -1;
            const videoMimeType = isSafari? "video/mp4" : "video/webm;codecs=h264";

            const mediaRecorder = new MediaRecorder(
                this.videoStream,
                { mimeType: videoMimeType }
            );

            const startRecVideo = (event) => {
                if(event.data.size > 0) { chunks.push(event.data); }
            }

            const stopRecVideo = () => {
                mediaRecorder.stop();
                mediaRecorder.removeEventListener("dataavailable", startRecVideo);
                
                // assign video file for save
                this.$refs.btnShare.addEventListener("click", () => {
                    let fileName = dateTimeNow() + ".mp4";
                    let fileBlob = new Blob(chunks, { type: videoMimeType });
                    let file = new File([fileBlob], fileName, { type: videoMimeType });
                    let filesArr = [file];

                    if(navigator.canShare && navigator.canShare({ files: filesArr })) {
                        navigator.share({ files: filesArr })
                        .catch((error) => console.log('Sharing failed', error));
                    } else {
                        alert("Your browser seems doesn't support Web Share API.");
                    }
                }, {once: true});
            }

            const ctrlRecVideoTime = () => {
                return new Promise((resolve, reject) => {
                    const camera = this.$refs.camera;
                    const canvas = this.$refs.screenshot;

                    let countdown = this.videoLength; // seconds
                    let timerID = setInterval(() => {
                        if(countdown === 0) {
                            // stop recording & countdown
                            this.recState = false;
                            this.videoTimeCountdown = "00:" + zeroPad(this.videoLength);

                            this.closeCamera();

                            clearInterval(timerID);
                            resolve();
                        } else {
                            // countdown
                            countdown -= 1;
                            this.videoTimeCountdown = "00:" + zeroPad(countdown);
                            
                            // screenshot for every 5 sec
                            if(countdown % 5 === 0) {
                                canvas.getContext('2d').drawImage(camera, 0, 0, canvas.clientWidth, canvas.clientHeight);
                                images.push(canvas.toDataURL());
                            }
                        }
                    }, 1000);
                });
            }

            mediaRecorder.addEventListener("dataavailable", startRecVideo);
            mediaRecorder.addEventListener("stop", stopRecVideo, {once: true});
            mediaRecorder.start();

            ctrlRecVideoTime().then(() => {
                alert("Video recording has been completed.");
                
                // check internet connection status
                if(navigator.onLine) {
                    // upload images to server for analysis
                } else {
                    alert("No Internet connection. You can save the video for upload later.");
                }
            });
        }
    }
});