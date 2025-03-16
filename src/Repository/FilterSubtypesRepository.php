<?php

namespace App\Repository;

use App\Entity\FilterSubtypes;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<FilterSubtypes>
 */
class FilterSubtypesRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, FilterSubtypes::class);
    }

/*        /**
         * @return FilterSubTypes[] Returns an array of FilterSubTypes objects

    public function findByType($value): array
    {
        return $this->createQueryBuilder('subtype')
            ->innerJoin('subtype.type', 'subType', 'WITH', 'subtype.subType = :value')
            ->andWhere('type.subType = :val')
            ->setParameter('val', $value)
            ->orderBy('type.id', 'ASC')
            ->setMaxResults(10)
            ->getQuery()
            ->getResult()
            ;
    }*/

    //    public function findOneBySomeField($value): ?FilterSubTypes
    //    {
    //        return $this->createQueryBuilder('f')
    //            ->andWhere('f.exampleField = :val')
    //            ->setParameter('val', $value)
    //            ->getQuery()
    //            ->getOneOrNullResult()
    //        ;
    //    }
}
