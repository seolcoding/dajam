'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Search, Filter, MoreVertical, Eye, XCircle, DollarSign, ChevronLeft, ChevronRight } from 'lucide-react';

interface Subscription {
  id: string;
  user_id: string;
  user_name: string;
  plan: 'free' | 'pro';
  status: 'active' | 'cancelled' | 'expired';
  start_date: string;
  next_billing_date: string | null;
  amount: number;
}

interface SubscriptionTableProps {
  subscriptions?: Subscription[];
  isLoading?: boolean;
  totalCount?: number;
  currentPage?: number;
  pageSize?: number;
  onPageChange?: (page: number) => void;
}

// Mock data
const mockSubscriptions: Subscription[] = [
  {
    id: '1',
    user_id: 'user1',
    user_name: '김철수',
    plan: 'pro',
    status: 'active',
    start_date: '2024-01-01',
    next_billing_date: '2024-02-01',
    amount: 29000,
  },
  {
    id: '2',
    user_id: 'user2',
    user_name: '이영희',
    plan: 'free',
    status: 'active',
    start_date: '2024-01-15',
    next_billing_date: null,
    amount: 0,
  },
];

export function SubscriptionTable({
  subscriptions = mockSubscriptions,
  isLoading = false,
  totalCount = mockSubscriptions.length,
  currentPage = 1,
  pageSize = 10,
  onPageChange,
}: SubscriptionTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterPlan, setFilterPlan] = useState<'all' | 'free' | 'pro'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'cancelled' | 'expired'>('all');

  const filteredSubscriptions = subscriptions.filter((sub) => {
    const matchesSearch = sub.user_name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPlan = filterPlan === 'all' || sub.plan === filterPlan;
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;

    return matchesSearch && matchesPlan && matchesStatus;
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  const handleViewSubscription = (subscriptionId: string) => {
    console.log('View subscription:', subscriptionId);
  };

  const handleCancelSubscription = (subscriptionId: string) => {
    // TODO: Implement cancel with confirmation
    console.log('Cancel subscription:', subscriptionId);
  };

  const handleRefund = (subscriptionId: string) => {
    // TODO: Implement refund with confirmation
    console.log('Refund subscription:', subscriptionId);
  };

  const getStatusBadge = (status: Subscription['status']) => {
    const variants = {
      active: { variant: 'default' as const, label: '활성' },
      cancelled: { variant: 'secondary' as const, label: '취소됨' },
      expired: { variant: 'destructive' as const, label: '만료' },
    };
    const { variant, label } = variants[status];
    return <Badge variant={variant}>{label}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            로딩 중...
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between mb-4">
          <CardTitle>구독 목록 ({totalCount})</CardTitle>
        </div>
        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="사용자 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select
            value={filterPlan}
            onValueChange={(value) => setFilterPlan(value as 'all' | 'free' | 'pro')}
          >
            <SelectTrigger className="w-full md:w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="플랜" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 플랜</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
            </SelectContent>
          </Select>
          <Select
            value={filterStatus}
            onValueChange={(value) =>
              setFilterStatus(value as 'all' | 'active' | 'cancelled' | 'expired')
            }
          >
            <SelectTrigger className="w-full md:w-40">
              <SelectValue placeholder="상태" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">모든 상태</SelectItem>
              <SelectItem value="active">활성</SelectItem>
              <SelectItem value="cancelled">취소됨</SelectItem>
              <SelectItem value="expired">만료</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        {filteredSubscriptions.length === 0 ? (
          <div className="text-center py-12 text-muted-foreground">
            {searchQuery || filterPlan !== 'all' || filterStatus !== 'all'
              ? '검색 결과가 없습니다'
              : '구독이 없습니다'}
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="space-y-2">
              {/* Header */}
              <div className="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-muted/50 rounded-lg text-sm font-medium text-muted-foreground">
                <div className="col-span-2">사용자</div>
                <div className="col-span-2">플랜</div>
                <div className="col-span-2">상태</div>
                <div className="col-span-2">시작일</div>
                <div className="col-span-2">다음 결제일</div>
                <div className="col-span-1">금액</div>
                <div className="col-span-1 text-right">액션</div>
              </div>

              {/* Rows */}
              {filteredSubscriptions.map((subscription) => (
                <div
                  key={subscription.id}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  {/* User */}
                  <div className="md:col-span-2 flex items-center font-medium">
                    {subscription.user_name}
                  </div>

                  {/* Plan */}
                  <div className="md:col-span-2 flex items-center">
                    <Badge variant={subscription.plan === 'pro' ? 'default' : 'secondary'}>
                      {subscription.plan === 'pro' ? 'Pro' : 'Free'}
                    </Badge>
                  </div>

                  {/* Status */}
                  <div className="md:col-span-2 flex items-center">
                    {getStatusBadge(subscription.status)}
                  </div>

                  {/* Start Date */}
                  <div className="md:col-span-2 flex items-center text-sm">
                    {new Date(subscription.start_date).toLocaleDateString('ko-KR')}
                  </div>

                  {/* Next Billing Date */}
                  <div className="md:col-span-2 flex items-center text-sm text-muted-foreground">
                    {subscription.next_billing_date
                      ? new Date(subscription.next_billing_date).toLocaleDateString('ko-KR')
                      : '-'}
                  </div>

                  {/* Amount */}
                  <div className="md:col-span-1 flex items-center text-sm font-medium">
                    ₩{subscription.amount.toLocaleString()}
                  </div>

                  {/* Actions */}
                  <div className="md:col-span-1 flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewSubscription(subscription.id)}>
                          <Eye className="w-4 h-4 mr-2" />
                          상세보기
                        </DropdownMenuItem>
                        {subscription.status === 'active' && (
                          <DropdownMenuItem
                            onClick={() => handleCancelSubscription(subscription.id)}
                            className="text-orange-600"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            취소
                          </DropdownMenuItem>
                        )}
                        {subscription.plan === 'pro' && (
                          <DropdownMenuItem
                            onClick={() => handleRefund(subscription.id)}
                            className="text-red-600"
                          >
                            <DollarSign className="w-4 h-4 mr-2" />
                            환불
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4 pt-4 border-t">
                <div className="text-sm text-muted-foreground">
                  {totalCount}개 중 {(currentPage - 1) * pageSize + 1}-
                  {Math.min(currentPage * pageSize, totalCount)}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    이전
                  </Button>
                  <div className="text-sm">
                    {currentPage} / {totalPages}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onPageChange?.(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    다음
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
