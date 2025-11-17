import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import './styles/batch-client-upload-styles.css';

export default function BatchClientUpload({ onBatchSubmit, onCancel }) {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState([]);
  const [errors, setErrors] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const validatePhone = (phone) => /^(09\d{9}|9\d{9})$/.test(phone);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;

    const fileName = uploadedFile.name.toLowerCase();
    if (!fileName.endsWith('.xlsx') && !fileName.endsWith('.xls')) {
      alert('Please upload a valid Excel file (.xlsx or .xls)');
      return;
    }

    setFile(uploadedFile);
    setErrors([]);
    setPreview([]);

    try {
      const data = await uploadedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
        alert('The Excel file appears to be empty or corrupted.');
        return;
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        defval: '',
        raw: false
      });

      if (!jsonData || jsonData.length === 0) {
        alert('The Excel file contains no data rows.');
        return;
      }

      const validationErrors = [];
      const validRecords = [];
      const today = new Date().toISOString().split('T')[0];

      jsonData.forEach((row, index) => {
        const rowNum = index + 2;
        const rowErrors = [];
        let standardizedPhoneNumber = '';

        if (!row['First Name']?.trim()) rowErrors.push('First Name missing');
        if (!row['Family Name']?.trim()) rowErrors.push('Family Name missing');
        if (!row['Street Address']?.trim()) rowErrors.push('Street Address missing');
        if (!row['Region']?.trim()) rowErrors.push('Region missing');
        if (!row['City']?.trim()) rowErrors.push('City missing');
        if (!row['Barangay']?.trim()) rowErrors.push('Barangay missing');

        if (!row['Email']?.trim()) {
          rowErrors.push('Email missing');
        } else if (!validateEmail(row['Email'])) {
          rowErrors.push('Invalid email format');
        }

        if (!row['Phone Number']?.trim()) {
          rowErrors.push('Phone number missing');
        } else {
          let phone = row['Phone Number'].toString().replace(/\D/g, '');

          if (validatePhone(phone)) {
            if (phone.length === 10) {
              standardizedPhoneNumber = '0' + phone;
            } else {
              standardizedPhoneNumber = phone;
            }
          } else {
            rowErrors.push('Phone must be 11 digits (starting with 09) or 10 digits (starting with 9)');
          }
        }

        if (rowErrors.length > 0) {
          validationErrors.push({ row: rowNum, errors: rowErrors });
        } else {
          validRecords.push({
            prefix: row['Prefix'] || '',
            first_Name: row['First Name'],
            middle_Name: row['Middle Name'] || '',
            family_Name: row['Family Name'],
            suffix: row['Suffix'] || '',

            address: row['Street Address'],
            barangay_address: row['Barangay'],
            city_address: row['City'],
            province_address: row['Province'] || '',
            region_address: row['Region'],
            zip_code: row['Zip Code'] || '',

            phone_Number: standardizedPhoneNumber,
            email: row['Email'],

            client_Registered: today,
            client_active: true,
            is_archived: false
          });
        }
      });

      setErrors(validationErrors);
      setPreview(validRecords);

      if (validRecords.length === 0 && validationErrors.length === 0) {
        alert('No valid data found in the Excel file. Please check the column names match the template.');
      }
    } catch (error) {
      console.error('File reading error:', error);
      alert(
        'Error reading file: ' +
          error.message +
          '\n\nPlease ensure:\n1. The file is a valid Excel file\n2. The file is not corrupted\n3. The column headers match the template'
      );
      setFile(null);
      setErrors([]);
      setPreview([]);
    }
  };

  const downloadTemplate = () => {
    const template = [
      {
        Prefix: 'Mr.',
        'First Name': 'Juan',
        'Middle Name': 'Cruz',
        'Family Name': 'Dela Cruz',
        Suffix: 'Jr.',
        'Street Address': '123 Sample St.',
        Barangay: 'Barangay 1',
        City: 'Quezon City',
        Province: 'Metro Manila',
        Region: 'National Capital Region',
        'Zip Code': '1100',
        'Phone Number': '09171234567',
        Email: 'juan.delacruz@example.com'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clients');
    XLSX.writeFile(wb, 'client_batch_upload_template.xlsx');
  };

  const handleSubmit = async () => {
    if (preview.length === 0) {
      alert('No valid records to upload');
      return;
    }

    setIsProcessing(true);
    await onBatchSubmit(preview);
    setIsProcessing(false);
  };

  return (
    <div className="batch-upload-container">
      <div className="batch-upload-card">
        <h2 className="batch-upload-title">Client Batch Upload</h2>

        <div className="batch-upload-actions">
          <button onClick={downloadTemplate} className="batch-btn batch-btn-download">
            Download Template
          </button>

          <button onClick={() => fileInputRef.current?.click()} className="batch-btn batch-btn-upload">
            Upload Excel File
          </button>

          <input ref={fileInputRef} type="file" accept=".xlsx,.xls" onChange={handleFileUpload} className="batch-file-input" />
        </div>

        {file && (
          <div className="batch-file-info">
            <strong>Selected File:</strong> {file.name}
          </div>
        )}

        <div className="batch-scrollable-content">
          {errors.length > 0 && (
            <div className="batch-errors-container">
              <h3 className="batch-errors-title">Validation Errors ({errors.length})</h3>
              <div className="batch-errors-list">
                {errors.map((err, idx) => (
                  <div key={idx} className="batch-error-item">
                    <strong>Row {err.row}:</strong> {err.errors.join(', ')}
                  </div>
                ))}
              </div>
            </div>
          )}

          {preview.length > 0 && (
            <div className="batch-preview-container">
              <h3 className="batch-preview-title">Valid Records: {preview.length}</h3>
              <div className="batch-table-wrapper">
                <table className="batch-preview-table">
                  <thead className="batch-table-header">
                    <tr>
                      <th className="batch-table-th">Name</th>
                      <th className="batch-table-th">Email</th>
                      <th className="batch-table-th">Phone</th>
                      <th className="batch-table-th">Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((client, idx) => (
                      <tr key={idx} className="batch-table-row">
                        <td className="batch-table-td">
                          {[client.prefix, client.first_Name, client.middle_Name, client.family_Name, client.suffix]
                            .filter(Boolean)
                            .join(' ')}
                        </td>
                        <td className="batch-table-td">{client.email}</td>
                        <td className="batch-table-td">{client.phone_Number}</td>
                        <td className="batch-table-td">
                          {client.address}, {client.barangay_address}, {client.city_address}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          <div className="batch-instructions">
            <h4 className="batch-instructions-title">Instructions:</h4>
            <ol className="batch-instructions-list">
              <li>Download the Excel template</li>
              <li>Fill in client information (all required fields must be completed)</li>
              <li>
                <strong>Important:</strong> Do not modify the column headers in the template
              </li>
              <li>Save the file as .xlsx format</li>
              <li>Upload the completed file</li>
              <li>Review the preview and fix any errors</li>
              <li>Click "Upload" to create all clients</li>
            </ol>
            <div style={{ marginTop: '12px', padding: '8px', background: '#fff3cd', borderRadius: '4px', fontSize: '13px' }}>
              <strong> Common issues:</strong>
              <ul style={{ marginLeft: '20px', marginTop: '4px' }}>
                <li>Column names must exactly match the template (e.g., **"Family Name"** and **"Zip Code"**)</li>
                <li>Phone numbers must be 11 digits starting with 09</li>
                <li>Email addresses must be valid format</li>
                <li>Required fields: Given Name, Family Name, Street Address, Region, City, Barangay, Phone Number, Email</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="batch-upload-controls">
          <button onClick={onCancel} disabled={isProcessing} className="batch-btn batch-btn-cancel">
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            disabled={preview.length === 0 || isProcessing}
            className="batch-btn batch-btn-submit"
          >
            {isProcessing ? 'Processing...' : `Upload ${preview.length} Client${preview.length !== 1 ? 's' : ''}`}
          </button>
        </div>
      </div>
    </div>
  );
}
