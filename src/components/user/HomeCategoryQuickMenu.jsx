import { useMemo } from "react";
import { Link } from "react-router-dom";
import "../css/HomeCategoryQuickMenu.css";

const HomeCategoryQuickMenu = ({ menuData = [] }) => {
  const groupedMenu = useMemo(() => {
    const rootMap = new Map();

    menuData.forEach((item) => {
      if (!rootMap.has(item.rootCategoryId)) {
        rootMap.set(item.rootCategoryId, {
          rootCategoryId: item.rootCategoryId,
          rootCategoryName: item.rootCategoryName,
          sections: new Map(),
        });
      }

      const root = rootMap.get(item.rootCategoryId);

      if (!root.sections.has(item.sectionCategoryId)) {
        root.sections.set(item.sectionCategoryId, {
          sectionCategoryId: item.sectionCategoryId,
          sectionCategoryName: item.sectionCategoryName,
          items: [],
        });
      }

      root.sections.get(item.sectionCategoryId).items.push({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
      });
    });

    return Array.from(rootMap.values()).map((root) => ({
      ...root,
      sections: Array.from(root.sections.values()),
    }));
  }, [menuData]);

  if (!groupedMenu.length) return null;

  return (
    <section className="home-category-quick-section">
      <div className="home-category-quick-inner">
        <div className="home-category-quick-header">
          <span className="home-category-quick-label">CATEGORY</span>
          <h2>카테고리 바로가기</h2>
        </div>

        <div className="home-category-root-grid">
          {groupedMenu.map((root) => (
            <div className="home-category-root-card" key={root.rootCategoryId}>
              <div className="home-category-root-title-row">
                <h3>{root.rootCategoryName}</h3>
                <Link to={`/?categoryId=${root.rootCategoryId}`}>전체보기</Link>
              </div>

              <div className="home-category-section-list">
                {root.sections.map((section) => (
                  <div className="home-category-section-box" key={section.sectionCategoryId}>
                    <Link
                      to={`/?categoryId=${section.sectionCategoryId}`}
                      className="home-category-section-title"
                    >
                      {section.sectionCategoryName}
                    </Link>

                    <div className="home-category-chip-wrap">
                      {section.items.map((child) => (
                        <Link
                          key={child.categoryId}
                          to={`/?categoryId=${child.categoryId}`}
                          className="home-category-chip"
                        >
                          {child.categoryName}
                        </Link>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeCategoryQuickMenu;