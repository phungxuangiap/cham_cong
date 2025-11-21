CREATE DATABASE IF NOT EXISTS Attendance_System_Final CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE Attendance_System_Final;

CREATE TABLE POSITION (
    position_id VARCHAR(255) PRIMARY KEY,
    position_name VARCHAR(255) NOT NULL,
    description TEXT
);

CREATE TABLE WORK_SHIFT (
    shift_id VARCHAR(255) PRIMARY KEY,
    shift_name VARCHAR(255) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    max_late_time TIME
);

CREATE TABLE DEPARTMENT (
    department_id VARCHAR(255) PRIMARY KEY,
    department_name VARCHAR(255) NOT NULL,
    description TEXT,
    parent_department_id VARCHAR(255),
    manager_id VARCHAR(255) UNIQUE
);

CREATE TABLE EMPLOYEE (
    employee_id VARCHAR(255) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    phone_number VARCHAR(255) UNIQUE,
    personal_email VARCHAR(255) UNIQUE,
    company_email VARCHAR(255) UNIQUE,
    status VARCHAR(50) NOT NULL,
    join_date DATE NOT NULL,
    bank_account_number VARCHAR(255),
    bank_name VARCHAR(255),
    bank_branch VARCHAR(255),
    department_id VARCHAR(255),
    position_id VARCHAR(255) NOT NULL,
    manager_id VARCHAR(255)
);

CREATE TABLE USER_ACCOUNT (
    employee_id VARCHAR(255) PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    PRIMARY KEY (employee_id, username)
);

CREATE TABLE RAW_ATTENDANCE_LOG (
    employee_code VARCHAR(255) NOT NULL,
    log_time TIMESTAMP NOT NULL,
    source VARCHAR(255),
    PRIMARY KEY (employee_code, log_time)
);

CREATE TABLE DAILY_TIMESHEET (
    employee_id VARCHAR(255) NOT NULL,
    work_date DATE NOT NULL,
    shift_id VARCHAR(255) NOT NULL,
    check_in_time TIME,
    check_out_time TIME,
    minutes_late INT,
    minutes_early INT,
    notes TEXT,
    adjusted_by_employee_id VARCHAR(255),
    PRIMARY KEY (employee_id, work_date)
);

CREATE TABLE CONTRACT (
    employee_id VARCHAR(255) NOT NULL,
    signing_date DATE NOT NULL,
    contract_type VARCHAR(255),
    start_date DATE,
    end_date DATE,
    PRIMARY KEY (employee_id, signing_date)
);

CREATE TABLE LEAVE_REQUEST (
    employee_id VARCHAR(255) NOT NULL,
    created_date TIMESTAMP NOT NULL,
    leave_type VARCHAR(255),
    start_date DATE,
    end_date DATE,
    reason TEXT,
    status VARCHAR(50),
    approver_id VARCHAR(255),
    approved_date TIMESTAMP,
    rejection_reason TEXT,
    PRIMARY KEY (employee_id, created_date)
);

CREATE TABLE OVERTIME_REQUEST (
    employee_id VARCHAR(255) NOT NULL,
    created_date TIMESTAMP NOT NULL,
    ot_date DATE,
    start_time TIME,
    end_time TIME,
    total_hours DECIMAL(5, 2),
    reason TEXT,
    status VARCHAR(50),
    approver_id VARCHAR(255),
    PRIMARY KEY (employee_id, created_date)
);

ALTER TABLE DEPARTMENT ADD FOREIGN KEY (parent_department_id) REFERENCES DEPARTMENT(department_id);
ALTER TABLE DEPARTMENT ADD FOREIGN KEY (manager_id) REFERENCES EMPLOYEE(employee_id);
ALTER TABLE EMPLOYEE ADD FOREIGN KEY (position_id) REFERENCES POSITION(position_id);
ALTER TABLE EMPLOYEE ADD FOREIGN KEY (department_id) REFERENCES DEPARTMENT(department_id);
ALTER TABLE EMPLOYEE ADD FOREIGN KEY (manager_id) REFERENCES EMPLOYEE(employee_id);
ALTER TABLE USER_ACCOUNT ADD FOREIGN KEY (employee_id) REFERENCES EMPLOYEE(employee_id);
ALTER TABLE RAW_ATTENDANCE_LOG ADD FOREIGN KEY (employee_code) REFERENCES EMPLOYEE(employee_id);
ALTER TABLE DAILY_TIMESHEET ADD FOREIGN KEY (employee_id) REFERENCES EMPLOYEE(employee_id);
ALTER TABLE DAILY_TIMESHEET ADD FOREIGN KEY (shift_id) REFERENCES WORK_SHIFT(shift_id);
ALTER TABLE DAILY_TIMESHEET ADD FOREIGN KEY (adjusted_by_employee_id) REFERENCES USER_ACCOUNT(employee_id);
ALTER TABLE CONTRACT ADD FOREIGN KEY (employee_id) REFERENCES EMPLOYEE(employee_id);
ALTER TABLE LEAVE_REQUEST ADD FOREIGN KEY (employee_id) REFERENCES EMPLOYEE(employee_id);
ALTER TABLE LEAVE_REQUEST ADD FOREIGN KEY (approver_id) REFERENCES EMPLOYEE(employee_id);
ALTER TABLE OVERTIME_REQUEST ADD FOREIGN KEY (employee_id) REFERENCES EMPLOYEE(employee_id);
ALTER TABLE OVERTIME_REQUEST ADD FOREIGN KEY (approver_id) REFERENCES EMPLOYEE(employee_id);
