let filename = "";
function Init() {
  let fileSelect = document.getElementById("file-upload"),
    fileDrag = document.getElementById("file-drag");

  fileSelect.addEventListener("change", fileSelectHandler, false);

  // File Drop
  fileDrag.addEventListener("dragover", fileDragHover, false);
  fileDrag.addEventListener("dragleave", fileDragHover, false);
  fileDrag.addEventListener("drop", fileSelectHandler, false);
}

function fileDragHover(e) {
  var fileDrag = document.getElementById("file-drag");

  e.stopPropagation();
  e.preventDefault();

  fileDrag.className =
    e.type === "dragover" ? "hover" : "modal-body file-upload";
}

function fileSelectHandler(e) {
  // Fetch FileList object
  var files = e.target.files || e.dataTransfer.files;

  filename = files[0].name.split(".")[0] ? files[0].name.split(".")[0] : "";
  // Cancel event and hover styling
  fileDragHover(e);

  // Process all File objects
  for (var i = 0, f; (f = files[i]); i++) {
    // uploadFile(f);
    handleFiles(f);
  }
}
// Check for the various File API support.
if (window.File && window.FileList && window.FileReader) {
  Init();
} else {
  document.getElementById("file-drag").style.display = "none";
}

/////////////////////////////////
function allowDrop(event) {
  event.stopPropagation();
  event.preventDefault();
}
function handleFiles(files) {
  // Check for the various File API support.
  if (window.FileReader) {
    // FileReader are supported.
    getAsText(files);
  } else {
    alert("FileReader is not supported in this browser.");
  }
  document.getElementById("file-upload").value = "";
}

function getAsText(fileToRead) {
  let reader = new FileReader();
  // Handle errors load
  reader.onload = loadHandler;
  reader.onerror = errorHandler;
  // Read file into memory as UTF-8
  reader.readAsText(fileToRead);
}

function loadHandler(event) {
  let csv = event.target.result;
  processData(csv);
}
let resultValues = [];
function processData(csv) {
  let allTextLines = csv.split(/\r\n|\n/);
  console.log(allTextLines);
  let lines = [];
  let lineObj = {};
  let newline = [];
  let newLineObj = {};
  let resultForm = [];

  for (let k = 0; k < allTextLines.length - 1; k++) {
    lines.push(allTextLines[k].split(","));
    lines[k] = lines[k].map((item) => {
      return item.replaceAll(`\"`, ``);
    });

    let temp = lines[k].splice(4, 5);
    newline.push(temp);
  }
  lineObj = lines.map(function (x) {
    return {
      BookingId: x[0],
      EventDate: x[1],
      ContactName: x[2],
      City: x[3],
      Description: x[4],
      Quantity: x[5],
      AccountCode: x[6],
      InventoryItemCode: x[7],
      InvoiceNumber: x[8],
      Currency: x[9],
      TrackingName1: x[10],
      TrackingOption1: x[11],
      InvoiceDate: x[12],
      DueDate: x[13],
      EventTimeZone: x[14],
      EventId: x[15],
      IdentityId: x[16],
      IdentityType: x[17],
      Role: x[18],
    };
  });
  newLineObj = newline.map(function (x) {
    return {
      UnitAmount: x[0],
      BillableExpenses: x[1],
      Commission: x[2],
      WHTAgency: x[3],
      WHTBuyer: x[4],
    };
  });
  for (let j = 1; j < lineObj.length; j++) {
    let csvData = lineObj[j];
    let data = newLineObj[j];
    let DescriptionArray = [
      "	- Agency Booking Fee",
      "	- Withholding Tax (Agency)",
      " - Withholding Tax (Buyer)",
      "	+ Artist Expenses",
    ];
    let accCode = ["4000", "2300"];
    let year = new Date().getFullYear();
    let InvoiceDate = new Date().toISOString().slice(0, 10);
    let DueDate = new Date().toISOString().slice(0, 10);
    csvData.InvoiceNumber =
      csvData.Currency !== "USD"
        ? { InvoiceNumber: [year, csvData.ContactName, csvData.Currency] }
        : { InvoiceNumber: [year, csvData.ContactName] };
    debugger;
    if (data.UnitAmount !== "0") {
      resultForm.push({
        InvoiceNumber: csvData.InvoiceNumber,
        EventDate: csvData.EventDate,
        ContactName: csvData.ContactName,
        City: csvData.City,
        InventoryItemCode: "",
        Description: csvData.Description,
        Quantity: csvData.Quantity,
        UnitAmount: data.UnitAmount,
        Currency: csvData.Currency,
        AccountCode: csvData.AccountCode,
        TrackingName1: csvData.TrackingName1,
        TrackingOption1: csvData.TrackingOption1,
        InvoiceDate: InvoiceDate,
        DueDate: DueDate,
      });
    }
    if (data.Commission !== "0") {
      resultForm.push({
        InvoiceNumber: csvData.InvoiceNumber,
        EventDate: csvData.EventDate,
        ContactName: csvData.ContactName,
        City: csvData.City,
        InventoryItemCode: "",
        Description: DescriptionArray[0],
        Quantity: csvData.Quantity,
        Commission: `-${data.Commission}`,
        Currency: csvData.Currency,
        AccountCode: accCode[0],
        TrackingName1: csvData.TrackingName1,
        TrackingOption1: csvData.TrackingOption1,
        InvoiceDate: InvoiceDate,
        DueDate: DueDate,
      });
    }
    if (data.WHTAgency !== "0") {
      resultForm.push({
        InvoiceNumber: csvData.InvoiceNumber,
        EventDate: csvData.EventDate,
        ContactName: csvData.ContactName,
        City: csvData.City,
        InventoryItemCode: "",
        Description: DescriptionArray[1],
        Quantity: csvData.Quantity,
        WHTAgency: `-${data.WHTAgency}`,
        Currency: csvData.Currency,
        AccountCode: accCode[1],
        TrackingName1: csvData.TrackingName1,
        TrackingOption1: csvData.TrackingOption1,
        InvoiceDate: InvoiceDate,
        DueDate: DueDate,
      });
    }
    if (data.WHTBuyer !== "0") {
      resultForm.push({
        InvoiceNumber: csvData.InvoiceNumber,
        EventDate: csvData.EventDate,
        ContactName: csvData.ContactName,
        City: csvData.City,
        InventoryItemCode: "",
        Description: DescriptionArray[2],
        Quantity: csvData.Quantity,
        WHTBuyer: `-${data.WHTBuyer}`,
        Currency: csvData.Currency,
        AccountCode: csvData.AccountCode,
        TrackingName1: csvData.TrackingName1,
        TrackingOption1: csvData.TrackingOption1,
        InvoiceDate: InvoiceDate,
        DueDate: DueDate,
      });
    }
    if (data.BillableExpenses !== "0") {
      resultForm.push({
        InvoiceNumber: csvData.InvoiceNumber,
        EventDate: csvData.EventDate,
        ContactName: csvData.ContactName,
        City: csvData.City,
        InventoryItemCode: "",
        Description: DescriptionArray[3],
        Quantity: csvData.Quantity,
        BillableExpenses: data.BillableExpenses,
        Currency: csvData.Currency,
        AccountCode: csvData.AccountCode,
        TrackingName1: csvData.TrackingName1,
        TrackingOption1: csvData.TrackingOption1,
        InvoiceDate: InvoiceDate,
        DueDate: DueDate,
      });
    }
  }

  resultValues = resultForm.map((obj) => {
    let arr = Object.values(obj);
    arr = arr.map((item) => {
      if (typeof item == "object") {
        let objVals = Object.values(item);
        if (Array.isArray(objVals[0]) && objVals[0].length === 3) {
          return (
            objVals[0][0] +
            "-" +
            "00" +
            "-" +
            objVals[0][1] +
            "-" +
            objVals[0][2]
          );
        } else if (Array.isArray(objVals[0]) && objVals[0].length === 2) {
          return objVals[0][0] + "-" + "00" + "-" + objVals[0][1];
        } else {
          return objVals[0];
        }
      } else {
        return item;
      }
    });
    return arr;
  });
  resultHeadings = [
    "InvoiceNumber",
    "EventDate",
    "ContactName",
    "City",
    "InventoryItemCode",
    "Description",
    "Quantity",
    "UnitAmount",
    "Curreny",
    "AccountCode",
    "TrackingName1",
    "TrackingOption1",
    "InvoiceDate",
    "DueDate",
  ];
  resultValues.unshift(resultHeadings);
  // drawOutput(resultValues);
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      confirmButton: "btnn btn-success",
      cancelButton: "btnn btn-danger",
    },
    buttonsStyling: false,
  });

  swalWithBootstrapButtons
    .fire({
      // title: "Do you want to download the file?",
      text: "Click yes if you want to download!",
      // icon: "info",
      showCancelButton: true,
      confirmButtonText: "Yes, download it!",
      cancelButtonText: "No, cancel!",
      reverseButtons: true,
    })
    .then((result) => {
      if (result.isConfirmed) {
        downloadCSV(resultValues),
          swalWithBootstrapButtons.fire(
            "Downloaded!",
            "Your file has been downloaded.",
            "success"
          );
      }

      // else if (
      //   /* Read more about handling dismissals below */
      //   result.dismiss === Swal.DismissReason.cancel
      // ) {
      //   (resultValues = []),
      //     swalWithBootstrapButtons.fire(
      //       "Cancelled",
      //       "You didn't download the CSV :)",
      //       "error"
      //     );
      // }
    });
}

function errorHandler(evt) {
  if (evt.target.error.name == "NotReadableError") {
    alert("Cannot read the file!");
  }
}
// csv
function createCSV(array) {
  var keys = Object.keys(array[0]); //Collects Table Headers

  var result = ""; //CSV Contents

  array.forEach(function (item) {
    //Goes Through Each Array Object
    keys.forEach(function (key) {
      //Goes Through Each Object value
      result += item[key] + ","; //Comma Seperates Each Key Value in a Row
    });
    result += "\n"; //Creates New Row
  });

  return result;
}
function downloadCSV(array) {
  csv = "data:text/csv;charset=utf-8," + createCSV(array); //Creates CSV File Format
  excel = encodeURI(csv); //Links to CSV

  link = document.createElement("a");
  link.setAttribute("href", excel); //Links to CSV File
  link.setAttribute("download", `exported-${filename}-${Date.now()}.csv`); //Filename that CSV is saved as
  link.click();
}
