-- Query #1
-- Insert Tony Stark into DB
INSERT INTO public.account (
    account_firstname,
    account_lastname,
    account_email,
    account_password
)

VALUES(
    'Tony',
    'Stark',
    'tony@starkent.com',
    'Iam1ronM@n'
)

-- Query #2
-- Update Stark's role
UPDATE public.account 
SET account_type = 'Admin'
WHERE account_id = 1

-- Query #3
-- DELETE Stark from db
DELETE FROM public.account
WHERE account_id = 1;

-- Query #4
-- UPDATE Part of the description for the Hummer
UPDATE public.inventory
SET inv_description = REPLACE(inv_description, 'small interiors', 'a huge interior')
WHERE inv_id = 10

-- Query #5
-- Get Make, Model from inventory table and Classification name from classification table
SELECT classification_name, inv_make, inv_model
FROM public.classification
INNER JOIN public.inventory ON public.classification.classification_id = public.inventory.inv_id

-- Query #6
-- Add a folder "vehicles" to the file path for the images and thumbnails in the inventory table
UPDATE public.inventory
SET inv_image = REPLACE(inv_image, '/images', '/images/vehicles'), inv_thumbnail = REPLACE(inv_thumbnail, '/images', '/images/vehicles')