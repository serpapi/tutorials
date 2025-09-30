from serpapi import GoogleSearch
import json

def extract_amazon_data(api_key, search_term):
    """
    Extract titles, prices, and review counts from Amazon search results using SerpApi
    
    Args:
        api_key (str): Your SerpApi API key
        search_term (str): The search term for Amazon products
    
    Returns:
        list: List of dictionaries containing product information
    """
    
    # Set up search parameters
    params = {
        "api_key": api_key,
        "engine": "amazon",
        "k": search_term
    }
    
    # Perform the search
    search = GoogleSearch(params)
    results = search.get_dict()
    
    # Extract product data
    products = []
    
    # Check if organic results exist
    if "organic_results" in results:
        for item in results["organic_results"]:
            product_data = {}
            
            # Extract title
            if "title" in item:
                product_data["title"] = item["title"]
            
            # Extract price
            if "price" in item:
                product_data["price"] = item["price"]
            elif "price_raw" in item:
                product_data["price"] = item["price_raw"]
            
            # Extract review count
            if "reviews" in item:
                product_data["review_count"] = item["reviews"]
            elif "rating" in item and isinstance(item["rating"], dict) and "reviews" in item["rating"]:
                product_data["review_count"] = item["rating"]["reviews"]
            
            # Only add products that have at least a title
            if "title" in product_data:
                products.append(product_data)
    
    return products

def print_products(products):
    """
    Print the extracted product information in a formatted way
    
    Args:
        products (list): List of product dictionaries
    """
    print(f"\nFound {len(products)} products:\n")
    print("-" * 80)
    
    for i, product in enumerate(products, 1):
        print(f"Product {i}:")
        print(f"  Title: {product.get('title', 'N/A')}")
        print(f"  Price: {product.get('price', 'N/A')}")
        print(f"  Review Count: {product.get('review_count', 'N/A')}")
        print("-" * 80)

def save_to_json(products, filename="amazon_products.json"):
    """
    Save the extracted product data to a JSON file
    
    Args:
        products (list): List of product dictionaries
        filename (str): Name of the output JSON file
    """
    with open(filename, 'w', encoding='utf-8') as f:
        json.dump(products, f, indent=2, ensure_ascii=False)
    print(f"\nData saved to {filename}")

def main():
    """
    Main function to run the Amazon data extraction
    """
    # Your API key and search term
    api_key = "your-api-key"
    search_term = "Bluetooth Speakers"
    
    print(f"Searching for: {search_term}")
    print("Extracting product data...")
    
    try:
        # Extract the data
        products = extract_amazon_data(api_key, search_term)
        
        # Print the results
        print_products(products)
        
        # Save to JSON file
        save_to_json(products)
        
        # Print summary
        print(f"\nSummary:")
        print(f"- Total products found: {len(products)}")
        print(f"- Products with prices: {sum(1 for p in products if 'price' in p)}")
        print(f"- Products with review counts: {sum(1 for p in products if 'review_count' in p)}")
        
    except Exception as e:
        print(f"Error occurred: {str(e)}")
        print("Please check your API key and internet connection.")

if __name__ == "__main__":
    main()