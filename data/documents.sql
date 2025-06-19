
USE vss;
--
-- Documents table
-- 
CREATE TABLE documents (
  id          INT AUTO_INCREMENT PRIMARY KEY,

  textChi     VARCHAR(512) NOT NULL, 
  visited     INT DEFAULT 0, 
  embedding   VECTOR(4096) NOT NULL,  
  
  createdAt   TIMESTAMP DEFAULT CURRENT_TIMESTAMP, 
  updatedAt   TIMESTAMP, 
  updateIdent INT DEFAULT 0, 
    
  UNIQUE (textChi),
  VECTOR INDEX (embedding) M=16 DISTANCE=cosine
);

--
-- Reset everything 
--
UPDATE documents SET visited=0, updatedAt=NULL, updateIdent=0 WHERE 1=1; 

-- 
-- MariaDB Trigger to Increment updateIdent on Update
--
DELIMITER //

CREATE OR REPLACE TRIGGER before_update_documents 
BEFORE UPDATE ON documents 
FOR EACH ROW
BEGIN
    SET NEW.updatedAt = Now();
    SET NEW.updateIdent = OLD.updateIdent + 1;
END //

DELIMITER ;

