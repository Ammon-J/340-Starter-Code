const pool = require("../database/")
const { get } = require("../routes/static")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getAllClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all classifications with at least one approved inventory item
 * ************************** */
async function getClassifications() {
  try {
    const data = await pool.query(
      `SELECT DISTINCT c.classification_id, c.classification_name, c.classification_approved
      FROM public.classification AS c 
      JOIN public.inventory AS i 
      ON c.classification_id = i.classification_id 
      WHERE c.classification_approved = 'true' AND i.inv_approved = 'true'
      ORDER BY c.classification_name`,
    )
    return data.rows
  } catch (error) {
    console.error("getClassWithInv error " + error)
  }
}

/* ***************************
 *  Get all approved classifications
 * ************************** */
async function getApprovedClassifications(){
  try {
    const data = await pool.query(
      `SELECT * FROM public.classification 
      WHERE classification_approved = 'true'
      ORDER BY classification_name`,
    )
    return data.rows
  } catch (error) {
    console.error("getApprovedClassifications error " + error)
  } 
}

/* ***************************
 *  Get classification data by inv_id
 * ************************** */
async function getClassByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT c.classification_id, c.classification_name, c.classification_approved
      FROM public.classification AS c 
      JOIN public.inventory AS i 
      ON c.classification_id = i.classification_id 
      WHERE i.inv_id = $1`,
      [inv_id]
    )
    return data.rows
  } catch (error) {
    console.error("getClassByInvId error " + error)
  }
}

module.exports = {getClassifications}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}


/* ***************************
 *  Get a inventory item by inv_id
 * ************************** */
async function getItemByInvId(inv_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory
      WHERE inv_id = $1`,
      [inv_id]
    )
    return data.rows
  } catch (error) {
    console.error("getItemByInvId error " + error)
  }
}

/* **********************
 *   Check for existing class name
 * ********************* */
async function checkExistingClass(classification_name){
  try {
    const sql = "SELECT * FROM classification WHERE classification_name = $1"
    const className = await pool.query(sql, [classification_name])
    return className.rowCount
  } catch (error) {
    return error.message
  }
}

/* ***************************
 *  Add Classification
 * ************************** */
async function addClass(classification_name) {
    try {
      const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
      let result = await pool.query(sql, [classification_name])
      return result
    } catch (error) {
        return error.message
    }
}

/* ***************************
 *  Approve Classification
 * ************************** */
async function approveClass(classification_id, user_id, currDate) {
    try {
      const sql = "UPDATE classification SET classification_approved = 'true', account_id = $2, classification_approval_date = $3 WHERE classification_id = $1 RETURNING *"
      let result = await pool.query(sql, [classification_id, user_id, currDate])
      return result
    } catch (error) {
        return error.message
    } 
}

/* ***************************
 *  Get unapproved classes
 * ************************** */
async function getUnapprovedClasses() {
  try {
    const data = await pool.query(
      `SELECT * FROM public.classification 
      WHERE classification_approved = 'false'`,
    )
    return data.rows
  } catch (error) {
    console.error("getUnapprovedClasses error " + error)
  }
}

/* ***************************
  *  Add Inventory Item
  * ************************** */
async function addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
    inv_image = "/public/images/vehicles/no-image.png"
    inv_thumbnail = "/public/images/vehicles/no-image-tn.png"
    //inv_approved = "false"
    try {
      const sql = "INSERT INTO inventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)RETURNING *"
      let result = await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id])
      return result
    } catch (error) {
      return error.message
    }
}

/* ***************************
 *  Approve Inventory Item
 * ************************** */
async function approveInventory(inv_id, user_id, currDate) {
    try {
      const sql = "UPDATE inventory SET inv_approved = 'true', account_id = $2, inv_approved_date = $3 WHERE inv_id = $1 RETURNING *"
      let car = await getItemByInvId(inv_id);
      await approveClass(car[0].classification_id); // Approve the classification as well
      let result = await pool.query(sql, [inv_id, user_id, currDate])
      return result
    } catch (error) {
        return error.message
    } 
}

/* ***************************
 *  Get unapproved inventory items
 * ************************** */
async function getUnapprovedInventory() {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory 
      WHERE inv_approved = 'false'`,
    )
    return data.rows
  } catch (error) {
    console.error("getUnapprovedInventory error " + error)
  }
}

/* ***************************
 *  Update Inventory Item
 * ************************** */
async function updateInventory(inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
    try {
      const sql = "UPDATE inventory SET inv_id = $1, inv_make = $2, inv_model = $3, inv_year = $4, inv_description = $5, inv_image = $6, inv_thumbnail = $7, inv_price = $8, inv_miles = $9, inv_color = $10, classification_id = $11 WHERE inv_id = $1 RETURNING *"
      let result = await pool.query(sql, [inv_id, inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id])
      return result
    } catch (error) {
      return error.message
    }
}

/* ***************************
 *  Delete Inventory Item
 * ************************** */
 async function deleteInventoryItem(inv_id) {
  try {
    const sql = 'DELETE FROM inventory WHERE inv_id = $1'
    const data = await pool.query(sql, [inv_id])
  return data
  } catch (error) {
    new Error("Delete Inventory Error")
  }
}

/* ***************************
 *  Delete Classification Item
 * ************************** */
async function deleteClassItem(classification_id) {
  try {
    const sql = 'DELETE FROM classification WHERE classification_id = $1'
    const data = await pool.query(sql, [classification_id])
  return data
  } catch (error) {
    new Error("Delete Classification Error")
  } 
}

module.exports = {getClassifications, getAllClassifications, getClassByInvId, getApprovedClassifications, getInventoryByClassificationId, getItemByClassificationId: getItemByInvId, getItemByInvId, checkExistingClass, addClass, approveClass, getUnapprovedClasses, addInventory, approveInventory, getUnapprovedInventory, updateInventory, deleteInventoryItem, deleteClassItem};