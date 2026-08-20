# Caldova demo data

This folder contains the deterministic synthetic dataset for the LTG291 Caldova pharmacy operations demo. It represents OTC retail inventory and sales only; it contains no patient or clinical data.

Run the generator with:

```bash
npm run generate
```

The fixed seed in `generate.js` produces the same five CSV files on every run:

| File | Shape | Purpose |
| --- | ---: | --- |
| `stores.csv` | 15 stores | Store, region, city, and fictional manager identity |
| `products.csv` | 60 SKUs | OTC product catalog and pricing |
| `inventory.csv` | 900 rows | Store-by-SKU stock, reorder point, and safety stock |
| `sales.csv` | 63,000 rows | 70 days of store-by-SKU sales |
| `restock_requests.csv` | Header only | Contract reference; live requests are stored by Rayfin |

Several fixed store/SKU pairs are deliberately kept below 1.6 days of stock so the live demo always has obvious action candidates. `test/generator.test.js` captures the deterministic shape and hero-SKU invariants.
