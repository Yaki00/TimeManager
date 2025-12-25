import { Breadcrumb } from "antd";
import { Link } from "react-router";

export const Breadcrumbs = ({ items }) => {
  return (
    <Breadcrumb
      style={{ marginBottom: 20 }}
      items={items.map((item) => ({
        title: item.path ? <Link to={item.path}>{item.label}</Link> : item.label,
      }))}
    />
  );
};
