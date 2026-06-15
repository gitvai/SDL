const fs = require('fs');
let html = fs.readFileSync('invoice.html', 'utf8');

// The CSS for tables might need an update
const printCSS = `
        @media print {
            body { margin: 0; padding: 0; background: none; }
            .invoice-container { width: 100%; border: none; padding: 0; margin: 0; box-shadow: none; }
            .btn-action, .pdf-action { display: none !important; }
            * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
            .invoice-table, .invoice-table th, .invoice-table td { border: 1px solid #000 !important; border-collapse: collapse !important; }
            .teeth-quad { border-color: #000 !important; }
            .client-box, .words-box { border-bottom: 2px solid #000 !important; }
        }
`;

// Insert it right before </style>
html = html.replace('</style>', printCSS + '\n    </style>');

fs.writeFileSync('invoice.html', html);
console.log('Fixed invoice.html print borders');
