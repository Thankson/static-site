# GROW SEARCH Categories->Links Search

I wanted to highlight a small point regarding the **tab component logic**. For this component, we are using existing product search components.

Currently, the **default active tab** is determined solely based on the **index of the elements in the array** (default is `0`), and it updates based on user interaction (click). While this works well for general use, it introduces a limitation when we want to set a specific tab (e.g., **"Links"**) as the default — it requires manually changing its position in the array or updating the default index.

This approach might be **unnecessary or unintuitive**, especially if tab order is meant to stay consistent for UX reasons.

## Suggestion

So to  test cateogry "links" search, we need to select "links" tab

---

## Implementation Status

We have implemented the **"Links"** tab search using the provided mock API data:

```json
{
  "Success": true,
  "ErrorMessages": [],
  "Data": {
    "@Context": null,
    "@Id": "",
    "@Type": "Links",
    "Hydra:Member": [
      {
        "Result_Model": {
          "Title": "grow banner account",
          "Link": "https://dvusgrow.melaleuca.com/banner-ad",
          "ImageUrl": "-/media/cucumber.jpg"
        },
        "Object": {
          "Summary": "Testing"
        }
      },
      {
        "Result_Model": {
          "Title": "grow content block account",
          "Link": "https://dvusgrow.melaleuca.com/contentblock"
        }
      },
      {
        "Result_Model": {
          "Title": "My Account",
          "Link": "https://weblocalus.melaleuca.com/my-account"
        },
        "Object": {
          "Summary": "My Account"
        }
      },
      {
        "Result_Model": {
          "Title": "Account Access Request",
          "Link": "https://weblocalus.melaleuca.com/account/account-access-request"
        }
      },
      {
        "Result_Model": {
          "Title": "Create Account",
          "Link": "https://weblocalus.melaleuca.com/account/create-account"
        }
      },
      {
        "Result_Model": {
          "Link": "/businesscenter/securecontent/refer-a-friend-invite"
        }
      }
    ],
    "Hydra:TotalItems": 6
  }
}
```
For other tabs such as:
All
Digital Library
Learning
Updates
Events

Integration has not yet been implemented. Each of these tabs is being tracked with a separate ticket.