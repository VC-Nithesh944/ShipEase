create database Logistics;
use Logistics;

create Table Users(
	User_id int primary key auto_increment,
    Username varchar(255) NOT NULL,
    Email varchar(255) unique,
    Password varchar(255),
	);

create Table Orders(
	Order_id int primary key auto_increment,
	User_id int,
    Origin varchar(255),
    Destination varchar(255),
    Status enum('Pending','Shipped','Delivered') default 'Pending',
    Created_at timestamp default current_timestamp,
    Foreign key (User_id) references Users(User_id)
	);
    
create Table Shipments(
	Shipment_id int Primary Key auto_increment,
    Order_id int,
    Tracking_number varchar(255),
    Status enum('In Transit','Delivered') default 'In Transit',
    Estimated_Delivery Date,
    foreign key (Order_id) references Orders(Order_id)
	);
    
create Table Payments(
	Payment_id int Primary key auto_increment,
    Order_id int,
    Amount Decimal(10,2),
    Payment_status enum ('Pending','Successful','Unsuccessful') default 'Pending',
    Done_at timestamp default current_timestamp,
    foreign key (Order_id) references Orders(Order_id)
    );
    
create Table Contacts(
	Contact_id int Primary key auto_increment,
    User_id int null,
    User_name varchar(255),
    Email varchar(255),
    Message Text,
    Submitted_at timestamp default current_timestamp,
    foreign key (User_id) references Users(User_id) on delete set null
    );
    
    desc users; desc contacts; desc orders; desc payments; desc shipments;