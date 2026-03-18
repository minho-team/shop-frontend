import { useEffect, useMemo, useState } from "react";
import AdminLayout from "../../components/admin/AdminLayout";
import { getAdminCategoryList } from "../../api/admin/adminCategoryApi";
import "../../css/admin/AdminCategoryListPage.css";

const AdminCategoryListPage = () => {
  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(false);

  const [openDepth1, setOpenDepth1] = useState({});
  const [openDepth2, setOpenDepth2] = useState({});

  const fetchCategoryList = async () => {
    try {
      setLoading(true);
      const data = await getAdminCategoryList();
      setCategoryList(data || []);
    } catch (error) {
      console.error("카테고리 목록 조회 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategoryList();
  }, []);

  const categoryTree = useMemo(() => {
    const depth1List = categoryList.filter((item) => item.depth === 1);

    return depth1List.map((depth1) => {
      const depth2List = categoryList
        .filter((item) => item.parentId === depth1.categoryId)
        .map((depth2) => {
          const depth3List = categoryList.filter(
            (item) => item.parentId === depth2.categoryId
          );

          return {
            ...depth2,
            children: depth3List,
          };
        });

      return {
        ...depth1,
        children: depth2List,
      };
    });
  }, [categoryList]);

  const toggleDepth1 = (categoryId) => {
    setOpenDepth1((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  const toggleDepth2 = (categoryId) => {
    setOpenDepth2((prev) => ({
      ...prev,
      [categoryId]: !prev[categoryId],
    }));
  };

  return (
    <AdminLayout pageTitle="카테고리 관리">
      <div className="admin-category-page">
        <div className="admin-category-top">
          <div>
            <h2 className="admin-category-title">카테고리 목록</h2>
            <p className="admin-category-desc">
              1차, 2차, 3차 카테고리를 펼쳐서 확인할 수 있습니다.
            </p>
          </div>

          <div className="admin-category-count-box">
            총 <strong>{categoryList.length}</strong>개
          </div>
        </div>

        <div className="category-tree-card">
          {loading ? (
            <div className="admin-category-empty">
              카테고리 목록을 불러오는 중입니다.
            </div>
          ) : categoryTree.length === 0 ? (
            <div className="admin-category-empty">
              조회된 카테고리가 없습니다.
            </div>
          ) : (
            <div className="category-tree">
              {categoryTree.map((depth1) => {
                const isOpenDepth1 = !!openDepth1[depth1.categoryId];

                return (
                  <div key={depth1.categoryId} className="tree-section depth1-section">
                    <button
                      type="button"
                      className="tree-toggle depth1-toggle"
                      onClick={() => toggleDepth1(depth1.categoryId)}
                    >
                      <span className="tree-toggle-left">
                        <span className="tree-arrow">
                          {isOpenDepth1 ? "▾" : "▸"}
                        </span>
                        <span className="tree-name">{depth1.name}</span>
                      </span>
                      <span className="tree-meta">ID {depth1.categoryId}</span>
                    </button>

                    {isOpenDepth1 && (
                      <div className="tree-children depth2-group">
                        {depth1.children.length === 0 ? (
                          <div className="tree-empty-child">
                            하위 카테고리가 없습니다.
                          </div>
                        ) : (
                          depth1.children.map((depth2) => {
                            const isOpenDepth2 = !!openDepth2[depth2.categoryId];

                            return (
                              <div
                                key={depth2.categoryId}
                                className="tree-section depth2-section"
                              >
                                <button
                                  type="button"
                                  className="tree-toggle depth2-toggle"
                                  onClick={() => toggleDepth2(depth2.categoryId)}
                                >
                                  <span className="tree-toggle-left">
                                    <span className="tree-arrow">
                                      {isOpenDepth2 ? "▾" : "▸"}
                                    </span>
                                    <span className="tree-name">{depth2.name}</span>
                                  </span>
                                  <span className="tree-meta">
                                    ID {depth2.categoryId}
                                  </span>
                                </button>

                                {isOpenDepth2 && (
                                  <div className="tree-children depth3-group">
                                    {depth2.children.length === 0 ? (
                                      <div className="tree-empty-child">
                                        하위 카테고리가 없습니다.
                                      </div>
                                    ) : (
                                      depth2.children.map((depth3) => (
                                        <div
                                          key={depth3.categoryId}
                                          className="depth3-item"
                                        >
                                          <div className="depth3-name-wrap">
                                            <span className="depth3-dot" />
                                            <span className="depth3-name">
                                              {depth3.name}
                                            </span>
                                          </div>
                                          <span className="tree-meta">
                                            ID {depth3.categoryId}
                                          </span>
                                        </div>
                                      ))
                                    )}
                                  </div>
                                )}
                              </div>
                            );
                          })
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCategoryListPage;