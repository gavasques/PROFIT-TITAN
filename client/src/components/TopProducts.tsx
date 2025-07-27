import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function TopProducts() {
  const topProducts = [
    {
      id: 1,
      name: "Smartphone XYZ Pro",
      sku: "SPH-001",
      revenue: "R$ 12.450",
      margin: 45,
    },
    {
      id: 2,
      name: "Fone Bluetooth Ultra",
      sku: "FBT-002",
      revenue: "R$ 8.920",
      margin: 52,
    },
    {
      id: 3,
      name: "Carregador Wireless",
      sku: "CWL-003",
      revenue: "R$ 6.340",
      margin: 28,
    },
    {
      id: 4,
      name: "Capa Protetora Premium",
      sku: "CPP-004",
      revenue: "R$ 4.180",
      margin: 38,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Top Produtos</CardTitle>
          <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
            Ver todos
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {topProducts.map((product) => (
            <div key={product.id} className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div>
                  <p className="text-sm font-medium text-gray-900">{product.name}</p>
                  <p className="text-xs text-gray-500">SKU: {product.sku}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-gray-900">{product.revenue}</p>
                <Badge 
                  variant={product.margin >= 40 ? "default" : product.margin >= 30 ? "secondary" : "destructive"}
                  className={
                    product.margin >= 40 
                      ? "bg-green-100 text-green-800" 
                      : product.margin >= 30 
                      ? "bg-yellow-100 text-yellow-800"
                      : "bg-red-100 text-red-800"
                  }
                >
                  {product.margin}% margem
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
