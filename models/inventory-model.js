const pool = require("../database/")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
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

async function addClass(classification_name) {
    try {
      const sql = "INSERT INTO classification (classification_name) VALUES ($1) RETURNING *"
      let result = await pool.query(sql, [classification_name])
      return result
    } catch (error) {
        return error.message
    }
}

async function addInventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) {
    inv_image = "/public/images/vehicles/no-image.png"
    inv_thumbnail = "/public/images/vehicles/no-image-tn.png"
    try {
      const sql = "INSERT INTO inventory(inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)RETURNING *"
      let result = await pool.query(sql, [inv_make, inv_model, inv_year, inv_description, inv_image, inv_thumbnail, inv_price, inv_miles, inv_color, classification_id])
      return result
    } catch (error) {
      return error.message
    }
}

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

module.exports = {getClassifications, getInventoryByClassificationId, getItemByClassificationId: getItemByInvId, getItemByInvId, checkExistingClass, addClass, addInventory, updateInventory, deleteInventoryItem};