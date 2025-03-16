CREATE DATABASE IF NOT EXISTS filters_db;
USE filters_db;
GRANT ALL PRIVILEGES ON filters_db.* TO 'symfony'@'%';
FLUSH PRIVILEGES;
CREATE TABLE filter_types (
    id INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(50) DEFAULT NULL,
    PRIMARY KEY (id)
);
CREATE TABLE filter_subtypes (
    id INT AUTO_INCREMENT NOT NULL,
    type_id INT NOT NULL,
    name VARCHAR(50) DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (type_id) REFERENCES filter_types(id)
);
CREATE TABLE filter_values (
    id INT AUTO_INCREMENT NOT NULL,
    type_id INT NOT NULL, #added this
    value_type VARCHAR(50) DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (type_id) REFERENCES filter_types(id)
);
CREATE TABLE types_subtypes_assoc (
    id INT AUTO_INCREMENT NOT NULL,
    type_id INT NOT NULL,
    subtype_id INT NOT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (type_id) REFERENCES filter_types(id),
    FOREIGN KEY (subtype_id) REFERENCES filter_subtypes(id)
);
CREATE TABLE filters (
    id INT AUTO_INCREMENT NOT NULL,
    name VARCHAR(50) DEFAULT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE criteria (
    id INT AUTO_INCREMENT NOT NULL,
    filter_id INT NOT NULL,
    type_id INT NOT NULL,  -- type will reference filter_types.id
    subtype_id INT NOT NULL,  -- subtype will reference filter_subtypes.id
    value VARCHAR(50) DEFAULT NULL,
    PRIMARY KEY (id),
    FOREIGN KEY (filter_id) REFERENCES filters(id),
    FOREIGN KEY (type_id) REFERENCES filter_types(id),
    FOREIGN KEY (subtype_id) REFERENCES filter_subtypes(id)
);

INSERT INTO filter_types (name) VALUES ('Amount'), ('Title'), ('Date');
INSERT INTO filter_subtypes (name, type_id) VALUES
    ('More than', 1),
    ('Less than', 1),
    ('Equals', 1),
    ('Starts with', 2),
    ('Ends with', 2),
    ('Contains', 2),
    ('From', 3),
    ('To', 3);
INSERT INTO filter_values (type_id, value_type) VALUES
    (1, 'int'),
    (2, 'string'),
    (3, 'date');
INSERT INTO types_subtypes_assoc (type_id, subtype_id) VALUES (1,1), (1,2), (1,3);
INSERT INTO types_subtypes_assoc (type_id, subtype_id) VALUES (2,4), (2,5), (2,6);
INSERT INTO filters (name) VALUES ('First filter');
INSERT INTO filters (name) VALUES ('Second filter');
INSERT INTO criteria (filter_id, type_id, subtype_id, value) VALUES (1, 1, 1, 4);
INSERT INTO criteria (filter_id, type_id, subtype_id, value) VALUES (1, 2, 4, 'Meow');

