
const app = new Vue({
  el: "#app",
  data: {
    camera: 'off',
    invoiceDateY: 2022,
    invoiceDateM: 1,
    invoiceDateD: 1,
    invoiceTotal:"",
    invoiceNo:"",
    companyNo:"",
    message: ""
  },
  methods: {
    onInit(promise) {
      promise
      .catch(console.error);
    },

    async onDecode(decodedText) {
      try {
        const modalAdd = new bootstrap.Modal(this.$refs.modalAdd);
        const rawData = decodedText.split(':')[0];
        const data = {
          numInvoice: rawData.substring(0, 10),
          dateInvoice: rawData.substring(10, 17),
          sumInvoice: parseInt(rawData.substring(29, 37), 16),
          sellerTaxID: rawData.substring(45, 53)
        }

        this.setModalData(data);
        this.setAppData(data);
        this.stopScanner();

        modalAdd.show();
      }
      catch(err) {
        this.alert('[Error]\n' + decodedText);
      }
    },

    openScanner() {
      this.camera = 'auto';
      this.btnNavClick();
    },

    stopScanner() {
      this.camera = 'off';
      
      this.$nextTick(() => {  // clear camera canvas
        const canvas = document.getElementsByClassName('qrcode-stream-camera')[1];
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      });
    },
      
    paintOutline(detectedCodes, ctx) {
      for(const detectedCode of detectedCodes) {
        const [ firstPoint, ...otherPoints ] = detectedCode.cornerPoints

        ctx.strokeStyle = "red";

        ctx.beginPath();
        ctx.moveTo(firstPoint.x, firstPoint.y);
        for(const { x, y } of otherPoints) {
          ctx.lineTo(x, y);
        }
        ctx.lineTo(firstPoint.x, firstPoint.y);
        ctx.closePath();
        ctx.stroke();
      }
    },

    setModalData(data) {
      const date = 1911 + parseInt(data.dateInvoice.substring(0, 3)) 
      + '-' + data.dateInvoice.substring(3, 5) 
      + '-' + data.dateInvoice.substring(5, 7);

      this.$refs.numInvoice.value = data.numInvoice;
      this.$refs.dateInvoice.value = date;
      this.$refs.sumInvoice.value = data.sumInvoice;
      this.$refs.sellerTaxID.value = data.sellerTaxID;
    },

    setAppData(data) {
      this.invoiceDateY = 1911 + parseInt(data.dateInvoice.substring(0, 3));
      this.invoiceDateM = parseInt(data.dateInvoice.substring(3, 5));
      this.invoiceDateD = parseInt(data.dateInvoice.substring(5, 7));
      this.invoiceTotal = data.sumInvoice;
      this.invoiceNo = data.numInvoice;
      this.companyNo = data.sellerTaxID;
    },

    submitInvoiceInfo() {
      const data = {
        invoiceDateY: this.invoiceDateY,
        invoiceDateM: this.invoiceDateM,
        invoiceDateD: this.invoiceDateD,
        invoiceTotal: this.invoiceTotal,
        invoiceNo: this.invoiceNo,
        companyNo: this.companyNo
      };

      const url = "https://middleware.tainanshopping.tw/api/v1/invoice/addByPaper";
      const option = {
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
        "content-type": "application/json",
        "authorization": 'Bearer ' + this.$refs.token.value,
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_6) AppleWebKit/605.1.15"
        }
      }
    
      fetch(url, option).then(res => {
        return res.json();
      })
      .then(json => {
        if(json.message === 'success') this.alert("登錄成功!");
        else this.alert("登錄失敗!");
        this.openScanner();
      });
    },

    alert(message) {
      this.message = message;

      const modalAlert = new bootstrap.Modal(this.$refs.modalAlert);
      modalAlert.show();
    },

    about() {
      const modalAbout = new bootstrap.Modal(this.$refs.modalAbout);
      modalAbout.show();
    },

    btnNavClick() {
      this.$refs.btnNav.click();
    }
  }
});