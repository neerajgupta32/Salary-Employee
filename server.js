const http = require('http');
const fs = require('fs');
const path = require('path');
const qs = require('querystring');

const PORT = 3000;

const server = http.createServer((req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        try {
            fs.readFile(path.join(__dirname, 'index.html'), (err, data) => {
                if (err) {
                    res.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    res.end('Internal Server Error');
                } else {
                    res.writeHead(200, {
                        'Content-Type': 'text/html'
                    });
                    res.end(data);
                }
            });
        } catch (error) {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end('Internal Server Error');
        }
    } else if (req.method === 'POST' && req.url === '/submit') {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const parsedData = qs.parse(body);
                const {
                    empId,
                    empName,
                    department,
                    salary,
                    startDate,
                    leaveDays
                } = parsedData;

                const employee = {
                    empId,
                    empName,
                    department,
                    salary,
                    startDate,
                    leaveDays: leaveDays || 0 // Directly use leaveDays from form
                };

                fs.readFile(path.join(__dirname, 'employees.json'), (err, data) => {
                    let employees = [];

                    if (!err) {
                        employees = JSON.parse(data);
                    }

                    employees.push(employee);

                    fs.writeFile(path.join(__dirname, 'employees.json'), JSON.stringify(employees, null, 2), (err) => {
                        if (err) {
                            res.writeHead(500, {
                                'Content-Type': 'text/plain'
                            });
                            res.end('Internal Server Error');
                        } else {
                            res.writeHead(302, {
                                'Location': '/'
                            });
                            res.end();
                        }
                    });
                });
            } catch (error) {
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                res.end('Internal Server Error');
            }
        });
    } else if (req.method === 'POST' && req.url.startsWith('/delete')) {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const parsedData = qs.parse(body);
                const { empId } = parsedData;

                fs.readFile(path.join(__dirname, 'employees.json'), (err, data) => {
                    if (err) {
                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        res.end('Internal Server Error');
                    } else {
                        let employees = JSON.parse(data);
                        employees = employees.filter(employee => employee.empId !== empId);

                        fs.writeFile(path.join(__dirname, 'employees.json'), JSON.stringify(employees, null, 2), (err) => {
                            if (err) {
                                res.writeHead(500, {
                                    'Content-Type': 'text/plain'
                                });
                                res.end('Internal Server Error');
                            } else {
                                res.writeHead(302, {
                                    'Location': '/employees'
                                });
                                res.end();
                            }
                        });
                    }
                });
            } catch (error) {
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                res.end('Internal Server Error');
            }
        });
    } else if (req.method === 'POST' && req.url.startsWith('/update')) {
        let body = '';

        req.on('data', chunk => {
            body += chunk.toString();
        });

        req.on('end', () => {
            try {
                const parsedData = qs.parse(body);
                const {
                    empId,
                    empName,
                    department,
                    salary,
                    startDate,
                    leaveDays
                } = parsedData;

                console.log('Parsed Data:', parsedData);

                fs.readFile(path.join(__dirname, 'employees.json'), (err, data) => {
                    if (err) {
                        res.writeHead(500, {
                            'Content-Type': 'text/plain'
                        });
                        res.end('Internal Server Error');
                    } else {
                        let employees = JSON.parse(data);

                        employees = employees.map(employee => {
                            if (employee.empId === empId) {
                                return {
                                    empId,
                                    empName: empName || employee.empName,
                                    department: department || employee.department,
                                    salary: salary || employee.salary,
                                    startDate: startDate || employee.startDate,
                                    leaveDays: leaveDays !== undefined ? leaveDays : employee.leaveDays // Default to existing value if not provided
                                };
                            }
                            return employee;
                        });

                        fs.writeFile(path.join(__dirname, 'employees.json'), JSON.stringify(employees, null, 2), (err) => {
                            if (err) {
                                res.writeHead(500, {
                                    'Content-Type': 'text/plain'
                                });
                                res.end('Internal Server Error');
                            } else {
                                res.writeHead(302, {
                                    'Location': '/employees'
                                });
                                res.end();
                            }
                        });
                    }
                });
            } catch (error) {
                res.writeHead(500, {
                    'Content-Type': 'text/plain'
                });
                res.end('Internal Server Error');
            }
        });
    } else if (req.method === 'GET' && req.url === '/employees') {
        try {
            fs.readFile(path.join(__dirname, 'employees.json'), (err, data) => {
                if (err) {
                    res.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    res.end('Internal Server Error');
                } else {
                    const employees = JSON.parse(data);
                    res.writeHead(200, {
                        'Content-Type': 'text/html'
                    });
                    res.write(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Employee List</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    background: linear-gradient(to right, #74ebd5, #9face6);
                                    color: white;
                                    margin: 0;
                                    padding: 20px;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                }
                                h1 {
                                    color: #333;
                                }
                                table {
                                    width: 100%;
                                    max-width: 800px;
                                    border-collapse: collapse;
                                    background-color: white;
                                    color: #333;
                                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
                                    border-radius: 8px;
                                    overflow: hidden;
                                }
                                th, td {
                                    padding: 12px 15px;
                                    border: 1px solid #ddd;
                                }
                                th {
                                    background-color: #007bff;
                                    color: white;
                                    text-align: left;
                                }
                                tr:nth-child(even) {
                                    background-color: #f4f4f4;
                                }
                                button {
                                    background-color: #007bff;
                                    color: white;
                                    border: none;
                                    padding: 5px 10px;
                                    border-radius: 4px;
                                    cursor: pointer;
                                    font-size: 14px;
                                }
                                button:hover {
                                    background-color: #0056b3;
                                }
                                a {
                                    display: inline-block;
                                    margin-top: 20px;
                                    text-decoration: none;
                                    color: #007bff;
                                    font-size: 16px;
                                }
                                a:hover {
                                    text-decoration: underline;
                                }
                                .update-form {
                                    margin-top: 10px;
                                    display: flex;
                                    flex-direction: column;
                                }
                                .update-form input {
                                    margin-bottom: 5px;
                                    padding: 5px;
                                    border: 1px solid #ddd;
                                    border-radius: 4px;
                                }
                            </style>
                        </head>
                        <body>
                            <h1>Employee List</h1>
                            <table>
                                <thead>
                                    <tr>
                                        <th>Employee ID</th>
                                        <th>Employee Name</th>
                                        <th>Department</th>
                                        <th>Annual Salary</th>
                                        <th>Start Date</th>
                                        <th>Monthly Salary</th>
                                        <th>Salary Deducted for Leave</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                    `);
                    employees.forEach(employee => {
                        const monthlySalary = (parseFloat(employee.salary) / 12).toFixed(2);
                        const dailySalary = parseFloat(employee.salary) / 365;
                        const leaveDeduction = (dailySalary * employee.leaveDays).toFixed(2);
                        res.write(`
                            <tr>
                                <td>${employee.empId}</td>
                                <td>${employee.empName}</td>
                                <td>${employee.department}</td>
                                <td>${employee.salary}</td>
                                <td>${employee.startDate}</td>
                                <td>${monthlySalary}</td>
                                <td>${leaveDeduction}</td>
                                <td>
                                    <form action="/delete" method="POST" style="display:inline;">
                                        <input type="hidden" name="empId" value="${employee.empId}">
                                        <button type="submit">Delete</button>
                                    </form>
                                    <form action="/update" method="POST" class="update-form" style="display:inline;">
                                        <input type="hidden" name="empId" value="${employee.empId}">
                                        <input type="text" name="empName" placeholder="Name" value="${employee.empName}">
                                        <input type="text" name="department" placeholder="Department" value="${employee.department}">
                                        <input type="number" name="salary" placeholder="Salary" step="0.01" value="${employee.salary}">
                                        <input type="date" name="startDate" value="${employee.startDate}">
                                        <input type="number" name="leaveDays" placeholder="Leave Days" step="1" min="0" value="${employee.leaveDays}">
                                        <button type="submit">Update</button>
                                    </form>
                                </td>
                            </tr>
                        `);
                    });
                    res.write(`
                                </tbody>
                            </table>
                            <a href="/">Back to form</a>
                            <a href="/total-salary">Calculate Total Salary</a>
                        </body>
                        </html>
                    `);
                    res.end();
                }
            });
        } catch (error) {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end('Internal Server Error');
        }
    } else if (req.method === 'GET' && req.url === '/total-salary') {
        try {
            fs.readFile(path.join(__dirname, 'employees.json'), (err, data) => {
                if (err) {
                    res.writeHead(500, {
                        'Content-Type': 'text/plain'
                    });
                    res.end('Internal Server Error');
                } else {
                    const employees = JSON.parse(data);
                    const totalSalary = employees.reduce((sum, employee) => sum + parseFloat(employee.salary), 0);
                    res.writeHead(200, {
                        'Content-Type': 'text/html'
                    });
                    res.write(`
                        <!DOCTYPE html>
                        <html lang="en">
                        <head>
                            <meta charset="UTF-8">
                            <meta name="viewport" content="width=device-width, initial-scale=1.0">
                            <title>Total Salary</title>
                            <style>
                                body {
                                    font-family: Arial, sans-serif;
                                    background: linear-gradient(to right, #74ebd5, #9face6);
                                    color: white;
                                    margin: 0;
                                    padding: 20px;
                                    display: flex;
                                    flex-direction: column;
                                    align-items: center;
                                }
                                h1 {
                                    color: #333;
                                }
                                a {
                                    display: inline-block;
                                    margin-top: 20px;
                                    text-decoration: none;
                                    color: #007bff;
                                    font-size: 16px;
                                }
                                a:hover {
                                    text-decoration: underline;
                                }
                            </style>
                        </head>
                        <body>
                            <h1>Total Salary</h1>
                            <p>Total salary of all employees: ${totalSalary.toFixed(2)}</p>
                            <a href="/">Back to form</a>
                            <a href="/employees">View Employee List</a>
                        </body>
                        </html>
                    `);
                    res.end();
                }
            });
        } catch (error) {
            res.writeHead(500, {
                'Content-Type': 'text/plain'
            });
            res.end('Internal Server Error');
        }
    } else {
        res.writeHead(404, {
            'Content-Type': 'text/plain'
        });
        res.end('Not Found');
    }
});

server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
