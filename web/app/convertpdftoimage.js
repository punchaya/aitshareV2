// const fs = require('fs');
// const path = require('path');
// const pdf2img = require('pdf2img');
// import { fromPath } from "pdf2pic";

// const pdf2img = require("../js/others/pdf2img");

var convertpdftoimage = function (param) {
    let self = this;
    let model;
    let course = $COURSE;
    let viewparent;
    let scrollcontainer;
    let tab;
    let readonly = false;

    // let fs = require('fs');
    // let path = require('path');
    // let pdf2img = require('pdf2img');

    // let input = __dirname + '/test.pdf';

    // PDFJS.disableWorker = true; // due to CORS

    if (param) {
        if (param.model)
            model = param.model;

        if (param.children)
            course = param.children;

        if (param.readonly)
            readonly = param.readonly;
    }

    this.Show = function (parent) {
        viewparent = parent;
        viewparent.Clear();

        let newcontainer = new mobiwork.Container();

        scrollcontainer = newcontainer.Add(new mobiwork.ScrollContainer({
            fileformat: FILEFORMAT.TEXT,
            ondrop: function (data) {
                // let convert = new Pdf2Img();
                // convert.convert(data);
                // var PDFImage = require("pdf-image").PDFImage;

                let teeeemp = $PUBLIC + "temp.pdf";
                // let imagePaths = $PUBLIC + "documents/";

                var pdfImage = new PDFImage(teeeemp);
                pdfImage.convertFile().then(function (imagePaths) {
                    // [ /tmp/slide-0.png, /tmp/slide-1.png ]

                    console.log(pdfImage);
                });



            }
        }));
        newcontainer.Show(parent);

    };
};